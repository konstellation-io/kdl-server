from unittest.mock import MagicMock

import numpy as np
import pytest
import torch

import compute_vectors

TEST_DATASET_PATH = "tests/files/test_ds.pkl.gz"


def test_convert_to_batches():
    items = np.arange(0, 309978)
    batches = compute_vectors.convert_to_batches(items, 32)
    assert len(batches) == 9687
    assert batches[1][0] == 32
    assert batches[-1][-1] == 309977


def test_preprocess_output():
    title = "Test Title"
    abstract = "This **is** ñ a test \n a test is this"
    expected = "Test Title. This  is  ñ a test   a test is this"
    output = compute_vectors.create_inputs(title, abstract)
    assert expected == output


def test_get_inputs():
    expected_first_input = "title paper 0. abstract 0"
    expected_last_input = "title paper 9. abstract 9"
    inputs = compute_vectors.get_inputs(TEST_DATASET_PATH)
    assert expected_first_input == inputs[0]
    assert expected_last_input == inputs[-1]


def test_vectorize_batch_refuses_unbatched_samples():
    """vectorize_batch computes doc vectors from token vectors using a mean along a numbered dimension. This
    would return incorrect results silently if the function accepted unbatched input samples
    (e.g. of shape [56] instead of [1, 56] for a batch containing a single element). To avoid silent failures, we
    test that the function refuses inputs if they do not have the correct number of dimensions."""

    input_ids = [101, 4905, 2855, 4018, 102]
    attention_mask = [1, 1, 1, 1, 1]
    batch_not_ok = {'input_ids': torch.Tensor(input_ids),
                    'attention_mask': torch.Tensor(attention_mask)}
    ## Example of correct input shape for single-element batch:
    # batch_ok = {'input_ids': torch.Tensor([input_ids]),
    #             'attention_mask': torch.Tensor([attention_mask])}
    model = MagicMock()
    with pytest.raises(AssertionError):
        compute_vectors.vectorize_batch(batch_not_ok, model=model)
