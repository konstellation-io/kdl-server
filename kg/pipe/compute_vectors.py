from typing import Union, List, Dict

import numpy as np
import pandas as pd
import torch
import transformers
from transformers import AutoModel, AutoTokenizer
from transformers.tokenization_utils_base import BatchEncoding

from data_checks.vectors import check_vector_size

# Paths
ASSET_PATH = "assets/"
MODEL_PATH = ASSET_PATH + "model/"
OUTPUT_PATH = ASSET_PATH + "vectors.npy"
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"

# Constants
VECTOR_DIMS = 768
BATCH_SIZE = 1  # This batch size is a workaround for a padding problem.


def create_inputs(title: str, abstract: str) -> str:
    """
    This function creates inputs
    Args:
        title: paper title
        abstract: paper abstract
    Return:
        Clean and concatenated paper + abstract with format:
        "title. abstract"
    """
    title_abstract_str = f"{title}. {abstract}"
    return title_abstract_str.replace("\n", " ").replace("**", " ")


def get_inputs(input_path: str) -> np.ndarray:
    """
    Gets combination of title and abstracts for all the papers of the dataset.
    Args:
        input_path: dataset route
    Return:
        returns a numpy array with shape (number_of_inputs, 1)
    """
    df = pd.read_pickle(input_path, compression="gzip")[['title', 'abstract']]
    return np.vectorize(create_inputs)(df['title'], df['abstract'])


def convert_to_batches(input_items: Union[np.ndarray, range],
                       batch_size: int) -> list[list[np.str_]]:
    """
    Converts an iterable of items into a list of list
    of items of the same size.

    Args:
        input_items: list of input items can be list of inputs
        or range of indexes.
        batch_size: batch size

    Returns:
        output: (list of list of list) containing input items in groups of batch_size


    Example:
        > convert_to_batches(list(range(0, 100)), batch_size=32)
    """
    n_batches = int(np.ceil(len(input_items) / batch_size))

    output = [None] * n_batches

    for batch_no in range(n_batches):
        start = batch_no * batch_size
        end = np.min([batch_no * batch_size + batch_size, len(input_items)])

        output[batch_no] = input_items[start:end]

    return output


def tokenize_batch(samples: List[str],
                   tokenizer: transformers.PreTrainedTokenizer,
                   tokenizer_args: Dict,
                   device: torch.device) -> BatchEncoding:
    """
    Convert a list of texts to a BatchEconding as input for downstream use by the transformer (in the
    vectorize_batch function).

    Args:
        samples: (iterable of str) each string is a document (eg. paper abstract)
        tokenizer: (huggingface tokenizer object)
        tokenizer_args: dict with tokenizer config, excluding padding and return_tensors which are mandatory.
        device: device to pass the outputs to

    Returns:
        (transformers.tokenization_utils_base.BatchEncoding)
    """
    batch_tokens = tokenizer(samples, padding=True, return_tensors='pt', **tokenizer_args).to(device)
    return batch_tokens


def vectorize_batch(batch, model):
    """
    Passes a list of tokens to the transformer model for inference,
    returning a vector embedding for each input. Operates in batches.

    Args:
        batch: (iterable) a list with one element
         per document, each element containing document tokens,
            e.g.  [['tokens', 'for', 'first', 'paper', 'in', 'batch'],
            ['tokens', 'for', 'second', 'paper'], ...]
        model: (huggingface transformer model)
    """

    with torch.no_grad():
        vecs_by_token = model(batch)[0].detach()
        vecs_by_doc = torch.mean(vecs_by_token, dim=1)  # Doc vector is a simple mean of token vectors

    return vecs_by_doc.to("cpu")


def vectorize(inputs: np.ndarray, batch_size: int,
              tokenizer: transformers.PreTrainedTokenizer,
              tokenizer_args: dict[str],
              model: transformers.PreTrainedModel,
              device: torch.device) -> np.ndarray:
    """
    Main function of compute vectors gets an numpy array of strings
    and computes the vectors for it in batches for a given model and tokenizer
    a device can be specified (cpu/gpu).
    Args:
        inputs: An array of strings of shape (dataset rows).
        batch_size: Size of the computation batches.
        tokenizer: A pretrained tokenizer from the transformer library.
        model: A pretrained model from the transformer library loaded.
        device: The device where the computation will be performed
        either cpu or gpu
    Return:
        Returns an array of shape (number of inputs, vector_size)
    """
    # Convert inputs to batches
    batches = convert_to_batches(inputs, batch_size=batch_size)
    batch_idx = convert_to_batches(range(len(inputs)), batch_size=batch_size)

    # Tokenize per batch
    tokens_arxiv = list()
    for batch in batches:
        tokens_arxiv.append(tokenize_batch(batch,
                                           tokenizer=tokenizer,
                                           tokenizer_args=tokenizer_args,
                                           device=device))

    # Allocate arrays for output vectors
    vecs = np.zeros(shape=(len(inputs), VECTOR_DIMS))

    for idx, batch_tokens in zip(batch_idx, tokens_arxiv):
        print("Vectorizing batch idx", idx)
        vecs[idx, :] = vectorize_batch(batch_tokens, model=model)

    return vecs


if __name__ == "__main__":
    print("Starting vector computation stage")

    # Device options
    DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # Model conf
    print(f"Loading model and tokenizer from path: {MODEL_PATH}")
    TOKENIZER = AutoTokenizer.from_pretrained(MODEL_PATH)
    TOKENIZER_ARGS = dict(truncation=True, max_length=512)

    TRANSFORMER = AutoModel.from_pretrained(MODEL_PATH).to(DEVICE)

    # Vector computation
    print(f"Getting inputs from path {DATASET_PATH}")
    dataset_inputs = get_inputs(DATASET_PATH)
    print("Computing vectors")
    vectors = vectorize(inputs=dataset_inputs, batch_size=BATCH_SIZE,
                        model=TRANSFORMER, tokenizer=TOKENIZER,
                        tokenizer_args=TOKENIZER_ARGS,
                        device=DEVICE)

    # Output checks
    print("Starting checks")
    check_vector_size(vectors, dataset_inputs)

    # Saving output
    print("Saving vectors")
    np.save(OUTPUT_PATH, vectors)
    print(f"Vectors saved to: {OUTPUT_PATH}")
