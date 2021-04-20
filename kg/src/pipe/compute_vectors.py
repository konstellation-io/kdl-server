from typing import Union

import faiss
import numpy as np
import torch
import transformers
from pipe import utils
from pipe.data_checks.vectors import check_vector_size
from transformers import AutoModel, AutoTokenizer
from transformers.tokenization_utils_base import BatchEncoding

# Paths
ASSET_PATH = "assets/"
MODEL_PATH = ASSET_PATH + "model/"
OUTPUT_PATH = ASSET_PATH + "vectors.faiss"
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"

# Constants
BATCH_SIZE = 1


def tokenize_batch(samples: list[str],
                   tokenizer: transformers.PreTrainedTokenizer,
                   tokenizer_args: dict,
                   device: torch.device) -> BatchEncoding:
    """
    Convert a list of texts to a BatchEncoding as input for downstream use by the transformer (in the
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


def vectorize_batch(batch: Union[BatchEncoding, dict],
                    model: transformers.PreTrainedModel) -> np.ndarray:
    """
    Passes batched tokens for multiple documents to the transformer model for inference,
    aggregates all token vectors in a document into a document vector for that document,
    and returns a vector for each input document in the batch.

    Args:
        batch: (transformers BatchEncoding or dict), containing:
            'input_ids': a tensor with one row per document, each row containing tokens for that document,
                e.g. [[101, 4905, 2855, ... , 102,  0],   # Tokens for first doc in batch (padded by one),
                      [101, 823, 3338, ..., 1012, 102],   # Tokens for next doc (unpadded; longest in batch)
                      [101, 2219,  2800,  ..., 0,   0]    # Tokens for final doc (padded at the end)
            'attention_mask': a tensor with one row per document, each row containing attention mask for that doc
                e.g. [[1, 1, 1, ..., 1, 0],  # Attention mask for first paper, etc.
                      [1, 1, 1, ..., 1, 1],
                      [1, 1, 1, ..., 0, 0]]

        model: (transformers.PreTrainedModel)

    Returns:
        (torch Tensor) of shape (batch_size, vector_dims)
    """
    assert len(batch['input_ids'].shape) == 2  # dimension 1: docs in batch, dimension 2: tokens in doc
    batch_size = batch['input_ids'].shape[0]
    vecs_by_doc = torch.zeros(batch_size, model.config.dim)

    with torch.no_grad():

        vecs_by_token = model(input_ids=batch['input_ids'].to(model.device),
                              attention_mask=batch['attention_mask'].to(model.device))[0].detach()

        # Attention masks are not sufficient to completely ignore the padding tokens when computing the doc vector
        for i, (ids, mask) in enumerate(zip(batch['input_ids'], batch['attention_mask'])):
            n_unmasked_tokens = mask.sum().item()
            vecs_by_doc[i, :] = torch.mean(vecs_by_token[i, :n_unmasked_tokens, :], dim=0)

    return vecs_by_doc.cpu()


def vectorize(inputs: list[str], batch_size: int,
              tokenizer: transformers.PreTrainedTokenizer,
              tokenizer_args: dict,
              model: transformers.PreTrainedModel,
              device: torch.device,
              verbose: bool = True) -> np.ndarray:
    """
    Main function of compute vectors gets an numpy array of strings
    and computes the vectors for it in batches for a given model and tokenizer
    a device can be specified (cpu/gpu).
    Args:
        inputs: An iterable of strings, typically documents to be vectorized (shape: (n_documents)).
        batch_size: Size of the computation batches.
        tokenizer: A pretrained tokenizer from the transformer library.
        tokenizer_args: arguments for calling the tokenizer.
            Recommended values {'truncation': True, 'max_length': model.config.max_position_embeddings}
        model: A pretrained model from the transformer library loaded.
        device: The device where the computation will be performed, either cpu or gpu
        verbose: if True, print progress for every processed batch
    Return:
        Returns an array of shape (number of inputs, vector_size)
    """
    # Convert inputs to batches
    batches_of_docs = utils.convert_to_batches(inputs, batch_size=batch_size)
    batch_idx = utils.convert_to_batches(range(len(inputs)), batch_size=batch_size)

    tokens_batch_generator = (
        tokenize_batch(batch, tokenizer=tokenizer, tokenizer_args=tokenizer_args, device=device)
        for batch in batches_of_docs)

    # Allocate array for output vectors
    vecs = np.zeros(shape=(len(inputs), model.config.dim))

    for idx, batch_tokens in zip(batch_idx, tokens_batch_generator):
        if verbose:
            print("Vectorizing batch idx", idx)
        vecs[idx, :] = vectorize_batch(batch_tokens, model=model)

    return vecs


def create_vector_index(vecs: np.ndarray) -> faiss.Index:
    """
    A utility function to create the vector index for searches and distance computation
    Args:
        vecs: an array of shape (number_of_vectors, vector_dimensions)
    Return:
        index: a faiss index of type FlatIP
    """
    vecs = vecs.astype("float32")
    index = faiss.IndexFlatIP(vecs.shape[1])
    faiss.normalize_L2(vecs)
    index.add(vecs)

    return index


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
    dataset_inputs = utils.get_inputs(DATASET_PATH)
    print("Computing vectors")
    vectors = vectorize(inputs=dataset_inputs, batch_size=BATCH_SIZE,
                        model=TRANSFORMER, tokenizer=TOKENIZER,
                        tokenizer_args=TOKENIZER_ARGS,
                        device=DEVICE)

    # Output checks
    print("Starting checks")
    check_vector_size(vectors, dataset_inputs)

    # Computing index
    print("Starting index computation")
    vector_index = create_vector_index(vectors)
    # Saving output
    print("Saving vectors index")
    faiss.write_index(vector_index, OUTPUT_PATH)
    print(f"Vector index saved to: {OUTPUT_PATH}")
