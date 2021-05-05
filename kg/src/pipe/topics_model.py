import math
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import transformers
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report
from torch import nn
from torch.utils.data import DataLoader, Dataset

from pipe import utils


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


def get_topics_table(Y_probs, topic_names, cutoff_paper=100):
    """Computes topic relevance from a stack of papers (in rows) containing topic probabilities (in columns) for each paper.

    Args:
        Y_probs: (np array) with dim (n_papers, n_topics), where the papers are arranged by order of score (only top N papers
            will be included in top topic computation, where N is defined by the cutoff_paper paramenter)
        topic_names: (list) topics in order in which they appear in the Y_probs columns
        cutoff_paper: (int) study topic relevance up to this rank

    Returns:
        (pandas DataFrame)
    """
    topic_sums = Y_probs[:cutoff_paper, :].sum(axis=0)

    topic_counts_above_threshold = (Y_probs[:cutoff_paper, :] > 0.5).sum(axis=0)

    topics_idx_in_order = np.argsort(topic_sums)[::-1]
    topics_sums_in_order = topic_sums[topics_idx_in_order]
    topic_names_in_order = np.array(topic_names)[topics_idx_in_order]
    topic_counts_in_order = np.array(topic_counts_above_threshold)[topics_idx_in_order]

    df_topics = pd.DataFrame(
        zip(topics_idx_in_order, topic_names_in_order, topics_sums_in_order, topic_counts_in_order),
        columns=['topic_idx', 'topic_name', 'topic_relevance', 'topic_count']
    )

    return df_topics


class TfDataset(Dataset):

    def __init__(self, X, labels):
        self.X = X
        self.labels = labels
        self.tags_in_order = []  # Set during load_input_data()
        self.vocab_size = None  # Set during vectorize_inputs()

    def __getitem__(self, idx):
        item = {'X': self.X[idx],
                'labels': self.labels[idx]}
        return item

    def __len__(self):
        return len(self.X)


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

    def identify_topics_to_exclude(self, report_df):

        threshold_metric = self.config['METRIC_TO_THRESHOLD']
        threshold_value = self.config['THRESHOLD']

        passes_threshold = report_df[threshold_metric] >= threshold_value
        self.excluded_topics_idx = np.where(~passes_threshold)[0]
        self.excluded_topics = report_df[~passes_threshold]

    def train_once(self):

        device = self.device

        # Set up torch Dataset and DataLoader
        train_set = TfDataset(self.X_train, self.Y_train)
        val_set = TfDataset(self.X_val, self.Y_val)

        dataloader_train = DataLoader(train_set, shuffle=True, batch_size=self.config['BATCH_SIZE'])
        dataloader_val = DataLoader(val_set, shuffle=True, batch_size=self.config['BATCH_SIZE'])

        # Model setup:
        torch.cuda.empty_cache()

        model = DNNModel(n_vocab=self.vocab_size, n_labels=self.Y_val.shape[1])

        model.to(device).float()
        criterion = nn.BCEWithLogitsLoss()
        optimizer = torch.optim.AdamW(model.parameters(), lr=self.config['LEARNING_RATE'],
                                      weight_decay=self.config['WEIGHT_DECAY'])
        scheduler = transformers.get_linear_schedule_with_warmup(optimizer,
                                                                 num_warmup_steps=1,
                                                                 num_training_steps=math.ceil(
                                                                     self.config['N_EPOCHS'] * len(
                                                                         dataloader_train)))

        # Training loop:
        # ... allocate variables to record loss per batch and per epoch
        df_loss = pd.DataFrame([], columns=['epoch', 'loss', 'val_loss'])
        df_loss_epochs = pd.DataFrame([], columns=['epoch', 'loss', 'val_loss'])

        for epoch in range(self.config['N_EPOCHS']):

            # training phase
            model.train()
            train_loss = 0
            for i, batch in enumerate(dataloader_train):
                effective_epoch = epoch + i / len(dataloader_train)

                optimizer.zero_grad()
                output = model(batch['X'].float().to(device))
                batch_loss = criterion(output, batch['labels'].float().to(device))
                batch_loss.backward()
                optimizer.step()
                train_loss += batch_loss.item()
                df_loss = df_loss.append(dict(epoch=effective_epoch, loss=batch_loss.item(), val_loss=np.nan),
                                         ignore_index=True)

                scheduler.step()

            train_loss = train_loss / len(dataloader_train)

            # evaluation phase
            with torch.no_grad():
                model.eval()
                val_loss = 0
                for i, batch in enumerate(dataloader_val):
                    effective_epoch = epoch + i / len(dataloader_val)

                    y_pred = model(batch['X'].to(device).float())
                    batch_val_loss = criterion(y_pred, batch['labels'].float().to(device))
                    val_loss += batch_val_loss.item()
                    df_loss = df_loss.append(
                        dict(epoch=effective_epoch, loss=np.nan, val_loss=batch_val_loss.item()),
                        ignore_index=True)

                val_loss = val_loss / len(dataloader_val)

            df_loss_epochs = df_loss_epochs.append(dict(epoch=epoch, loss=train_loss, val_loss=val_loss),
                                                   ignore_index=True)

            if epoch % 1 == 0:
                print(f'[{epoch + 1}] Train Loss: {train_loss:.3f}; Val Loss: {val_loss:.3f}')

        # Evaluate on val_set
        Y_logits = model(torch.tensor(self.X_val).float().to(device))
        Y_preds = Y_logits > 0

        report_df = pd.DataFrame(classification_report(y_true=self.Y_val, y_pred=Y_preds.cpu().detach().numpy(),
                                                       target_names=self.tags_in_order, output_dict=True)).T
        report_df = pd.merge(report_df, pd.DataFrame(self.tag_counts, columns=['n_papers']), left_index=True,
                             right_index=True)

        metrics = dict(
            f1_mean=report_df['f1-score'].mean(),
            f1_median=report_df['f1-score'].median(),
            f1_weighted=np.average(report_df['f1-score'], weights=report_df['support']),
            train_loss=df_loss_epochs['loss'].values[-1],
            val_loss=df_loss_epochs['val_loss'].values[-1])

        self.model = model
        self.report_df = report_df

        return report_df, metrics
