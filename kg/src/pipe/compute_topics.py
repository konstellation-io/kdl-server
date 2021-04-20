import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from pipe import utils
from sklearn.feature_extraction.text import TfidfVectorizer
from torch import nn

# Paths
ASSET_PATH = "assets/"
INPUT_PATH = "inputs/"

TOPICS_MODEL_PATH = INPUT_PATH + "topics_model"
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"

OUTPUT_TOPICS_PATH = ASSET_PATH + "topics.pkl.gz"

# Constants
BATCH_SIZE = 32


def get_topics_from_probs(topic_probs, topic_names, threshold=0.5):
    """Given a 2D array of topic probabilities per document (and corresponding topic names),
    returns a human-readable output of topics for each input document (above provided threshold
    probability, 50% by default).
    (Replaces obsolete summarize_topic_mixture.)

    Args:
        topic_probs: (numpy array) of shape (n_docs, n_topics) containing all topic
         probabilities for that document.
        topic_names: (list) names of topics corresponding to columns in topic_probs
        threshold: (float) probability required for a topic to be included in the
        output list of assigned/predicted topics

    Returns:
        (list of dict) in the form of {'topic_name': topic_prob}, e.g.:
             [{'topic_1': prob_topic_1, 'topic_2': prob_topic_2},  # Doc 1 with 2 assigned topics
              {},                                                  # Doc 2 without topics
              {'topic_1': prob_topic_1}, ...]                      # Doc 3 with 1 assigned topic
    """
    output_list = list()

    for w_row in topic_probs:
        top_idx = np.where(w_row > threshold)[0]
        top_topic_names = [topic_names[idx] for idx in top_idx]
        top_topic_weights = [w_row[idx] for idx in top_idx]
        topics_summary_dict = [(name, weight) for weight, name
                               in sorted(zip(top_topic_weights,
                                             top_topic_names))[::-1]]

        output_list.append(topics_summary_dict)

    return output_list


class DNNModel(nn.Module):

    def __init__(self, n_vocab, n_labels):
        super().__init__()

        self.n_vocab = n_vocab
        self.n_labels = n_labels

        self.initialize_layers()

    def initialize_layers(self):
        self.dropout = nn.Dropout(0)
        self.dense_1 = nn.Linear(in_features=self.n_vocab, out_features=self.n_labels)
        self.bn_1 = nn.BatchNorm1d(num_features=self.n_labels)

    def forward(self, x):
        x = self.dropout(x)
        x = self.dense_1(x)
        x = self.bn_1(x)
        return x


class DNNTopicPredictor:
    """
    """

    def __init__(self, config=None, load_for_inference=False, filepath_saved_model=None):

        self.config = config
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tags_in_order = None
        self.topic_names = None
        self.tag_counts = None
        self.vocab_size = None
        self.vectorizer = None
        self.model = None
        self.report_df = None
        self.excluded_topics = None
        self.excluded_topics_idx = None

        if load_for_inference:
            self.load_for_inference(filepath_saved_model)

        else:
            raise NotImplementedError

    def load_for_inference(self, filepath):

        def load_vectorizer(filepath=filepath):
            with open(Path(filepath) / "vectorizer.pk", "rb") as f:
                vectorizer = pickle.load(f)
            return vectorizer

        # Load vectorizer
        self.vectorizer = load_vectorizer(filepath)
        self.vocab_size = len(self.vectorizer.vocabulary_)

        # Load topic names (labels)
        self.topic_names = utils.read_list_from_file(Path(filepath) / "topic_names.txt")

        # Create a net with the same structure
        self.model = DNNModel(n_vocab=self.vocab_size, n_labels=len(self.topic_names))

        # Load state_dict
        saved_state = torch.load(Path(filepath) / "model_state.pt", map_location=self.device)
        self.model.load_state_dict(saved_state)
        self.model.to(self.device)
        self.model.eval()

        # Load excluded topic indices
        self.excluded_topics_idx = np.array(
            [int(x) for x in utils.read_list_from_file(Path(filepath) / "excluded_topics_idx.txt")])

    def vectorize_inputs(self):

        print("Vectorizing inputs...")

        VECTORIZER_ARGS = dict(
            min_df=self.config['MIN_DF'],
            max_df=self.config['MAX_DF'],
            token_pattern=self.config['TOKEN_PATTERN'],
            ngram_range=self.config['NGRAM_RANGE']
        )

        # Extract features using TFIDF vectorizer
        vectorizer = TfidfVectorizer(strip_accents='unicode',
                                     stop_words='english',
                                     lowercase=True,
                                     **VECTORIZER_ARGS)
        X_train = vectorizer.fit_transform(
            self.texts_train).toarray()  # Converting sparse matrix to array makes it easier to use downstream
        X_val = vectorizer.transform(self.texts_val).toarray()
        self.vectorizer = vectorizer
        self.vocab_size = len(vectorizer.vocabulary_)

        X_train = torch.tensor(X_train).float()  # Converting to correct type for use by the net
        X_val = torch.tensor(X_val).float()

        return X_train, X_val

    def predict_topics(self, texts, filter_excluded_topics=True):
        """Given a list of texts, provides predicted topics for each of the input texts,
        optionally ignoring any topics previously identified as not desirable to include
        (by identify_topics_to_exclude)."""

        # Vectorize input texts:
        try:
            X = self.vectorizer.transform(texts).toarray()
        except AttributeError:
            print(
                "Construct the DNNTopicPredictor vectorizer (in vectorize_inputs) before calling predict_topics.")
            raise

        # Forward model pass and covert activations to probabilities
        Y_logits = self.model(torch.tensor(X).float().to(self.device))
        sigmoid = nn.Sigmoid()
        Y_probs = sigmoid(Y_logits.detach().cpu()).numpy()

        # Remove from outputs the topics with poor prediction record on the val set
        if filter_excluded_topics:
            Y_probs[:, self.excluded_topics_idx] = 0

        # Convert to a more concise (and human-readable) format
        output_topic_list = get_topics_from_probs(Y_probs, topic_names=self.topic_names)

        return output_topic_list, Y_probs


def compute_topics():
    print("Starting topic computation stage ...")

    # Load the topic prediction model
    topic_model = DNNTopicPredictor(load_for_inference=True, filepath_saved_model=TOPICS_MODEL_PATH)

    # Load asset texts on which the topics need to be predicted
    print(f"Getting inputs from path {DATASET_PATH}")
    texts = utils.get_inputs(DATASET_PATH)
    doc_hashes = pd.read_pickle(DATASET_PATH)['id']

    # Convert to batches for higher efficiency of inference computation
    texts_in_batches = utils.convert_to_batches(texts, batch_size=BATCH_SIZE)
    hashes_in_batches = utils.convert_to_batches(doc_hashes, batch_size=BATCH_SIZE)

    # Allocate a data frame to store outputs
    df_output = pd.DataFrame([], index=doc_hashes, columns=['topics'])

    # Run the inference batch by batch
    for hashes, texts_batch in zip(hashes_in_batches, texts_in_batches):
        batch_topics, _ = topic_model.predict_topics(texts_batch)
        df_output.loc[hashes, 'topics'] = batch_topics

    # Save
    df_output.reset_index()
    df_output.to_pickle(OUTPUT_TOPICS_PATH, compression="gzip", protocol=5)
    print(f"Completed topic computation and saved at {OUTPUT_TOPICS_PATH}")


if __name__ == "__main__":
    compute_topics()
