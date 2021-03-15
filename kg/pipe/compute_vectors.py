import numpy as np
import pandas as pd
import torch
from torchnlp.encoders.text import BatchedSequences, pad_tensor
from transformers import AutoModel, AutoTokenizer

# PATHS
ASSET_PATH = "assets/"
MODEL_PATH = ASSET_PATH + "model/"
OUTPUT_PATH = ASSET_PATH + "vectors.npy"

# CONSTANTS
VECTOR_DIMS = 768
BATCH_SIZE = 32

# Inputs and outputs
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"
TOKENIZER_ARGS = dict(truncation=True, max_length=512)
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")


def convert_to_batches(input_items, batch_size):
    """

    Args:
        input_items: (list)
        batch_size: (int)

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


def stack_and_pad_tensors(batch, padding_index, max_len=None, dim=0):
    """ Pad a :class:`list` of ``tensors`` (``batch``) with ``padding_index``.

    Args:
        batch (:class:`list` of :class:`torch.Tensor`): Batch of tensors to pad.
        padding_index (int, optional): Index to pad tensors with.
        dim (int, optional): Dimension on to which to concatenate the batch of tensors.

    Returns
        BatchedSequences(torch.Tensor, torch.Tensor): Padded tensors and original lengths of
            tensors.
    """
    lengths = [tensor.shape[0] for tensor in batch]
    if max_len is None:
        max_len = max(lengths)
    padded = [pad_tensor(tensor, max_len, padding_index) for tensor in batch]
    lengths = torch.tensor(lengths)
    padded = torch.stack(padded, dim=dim).contiguous()
    for _ in range(dim):
        lengths = lengths.unsqueeze(0)

    return BatchedSequences(padded, lengths)


def tokenize_batch(samples, tokenizer):
    """
    Convert a list of texts to a list of tokens as input for downstream use by the transformer (in the vectorize_batch function).

    Args:
        samples: (iterable of str) each string is a document (eg. paper abstract)
        tokenizer: (huggingface tokenizer object)

    Returns:
        (torch.Tensor)
    """
    batch = []
    for sequence in samples:
        batch.append(torch.tensor(tokenizer.encode(sequence,
                                                   **TOKENIZER_ARGS)).to(DEVICE))
    stack_tensors = stack_and_pad_tensors(batch, tokenizer.pad_token_id, max_len=TOKENIZER_ARGS['max_length'])[0]
    return stack_tensors


def vectorize_batch(batch, model):
    """
    Passes a list of tokens to the transformer model for inference, returning a vector embedding for each input. Operates in batches.

    Args:
        batch: (iterable) a list with one element per document, each element containing document tokens,
            e.g.  [['tokens', 'for', 'first', 'paper', 'in', 'batch'], ['tokens', 'for', 'second', 'paper'], ...]
        model: (huggingface transformer model)
    """

    with torch.no_grad():
        vecs_by_token = model(batch)[0].detach()
        vecs_by_doc = torch.mean(vecs_by_token, dim=1)  # Doc vector is a simple mean of token vectors

    return vecs_by_doc.to("cpu")


def vectorize(inputs: np.ndarray, batch_size: int,
              tokenizer, model) -> np.ndarray:
    # Convert inputs to batches
    batches = convert_to_batches(inputs, batch_size=batch_size)
    batch_idx = convert_to_batches(range(len(inputs)), batch_size=batch_size)

    # Tokenize per batch
    tokens_arxiv = list()
    for batch in batches:
        tokens_arxiv.append(tokenize_batch(batch, tokenizer=tokenizer))

    # Allocate arrays for output vectors
    vecs = np.zeros(shape=(len(inputs), VECTOR_DIMS))

    for idx, batch_tokens in zip(batch_idx, tokens_arxiv):
        print("Vectorizing batch idx", idx)
        vecs[idx, :] = vectorize_batch(batch_tokens, model=model)


    return vecs


def create_inputs(title: str, abstract: str) -> str:
    """
    This function creates inputs
    Args:
        title: paper title
        abstract: paper abstract
    Return:
        Clean and concatenated paper + abstract
    """
    title_abstract_str = f"{title}. {abstract}"
    return title_abstract_str.replace("\n", " ").replace("**", " ")


def get_inputs(input_path: str) -> np.ndarray:
    """
    Gets combination of title and abstracts for all the papers of the dataset.
    """
    df = pd.read_pickle(input_path, compression="gzip")[['title', 'abstract']]
    inputs = np.vectorize(create_inputs)(df['title'], df['abstract'])

    return inputs


def compute_vectors(input_path: str, batch_size: int,
                    model, tokenizer) -> np.ndarray:
    """
    Computes embeddings for all abstracts of the dataset.
    """
    inputs = get_inputs(input_path)
    return vectorize(inputs, batch_size, model=model, tokenizer=tokenizer)


if __name__ == "__main__":
    DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    TOKENIZER = AutoTokenizer.from_pretrained(MODEL_PATH)
    TOKENIZER_ARGS = dict(truncation=True, max_length=512)

    TRANSFORMER = AutoModel.from_pretrained(MODEL_PATH).to(DEVICE)
    vecs = compute_vectors(DATASET_PATH, BATCH_SIZE,
                           model=TRANSFORMER, tokenizer=TOKENIZER)
    np.save(OUTPUT_PATH, vecs)

