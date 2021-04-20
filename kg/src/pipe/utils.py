from typing import Union

import numpy as np
import pandas as pd


def create_inputs(title: str, abstract: str) -> str:
    """
    This function creates inputs
    Args:
        title: paper title
        abstract: paper abstract
    Return:
        Clean and concatenated title + abstract with format:
        "title. abstract"
    """
    title_abstract_str = f"{title}. {abstract}"
    return title_abstract_str.replace("\n", " ").replace("**", " ")


def get_inputs(input_path: str) -> list[str]:
    """
    Gets combination of title and abstracts for all the papers of the dataset.
    Args:
        input_path: dataset route
    Return:
        returns a list of strings with length (number_of_inputs)
    """
    df = pd.read_pickle(input_path, compression="gzip")[['title', 'abstract']]
    return np.vectorize(create_inputs)(df['title'], df['abstract']).tolist()


def convert_to_batches(input_items: Union[np.ndarray, list, range],
                       batch_size: int) -> list[list[str]]:
    """
    Converts an iterable of items into a list of list
    of items of the same size.

    Args:
        input_items: list of input items can be list of inputs range of indexes.
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
