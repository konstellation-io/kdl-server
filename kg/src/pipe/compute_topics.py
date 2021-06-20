import pandas as pd

from pipe import utils
from pipe.topics_model import DNNTopicPredictor

# Paths
ASSET_PATH = "assets/"
INPUT_PATH = "inputs/"

TOPICS_MODEL_PATH = INPUT_PATH + "topics_model"
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"

OUTPUT_TOPICS_PATH = ASSET_PATH + "topics.pkl.gz"

# Constants
BATCH_SIZE = 32


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
