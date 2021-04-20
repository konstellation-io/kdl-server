from unittest.mock import MagicMock

import pytest
import torch

import compute_vectors


def test_vectorize_batch_refuses_unbatched_samples():
    """vectorize_batch computes doc vectors from token vectors using a mean along a numbered dimension. This
    would return incorrect results silently if the function accepted unbatched input samples
    (e.g. of shape [56] instead of [1, 56] for a batch containing a single element). To avoid silent failures, we
    test that the function refuses inputs if they do not have the correct number of dimensions."""

    input_ids = [101, 4905, 2855, 4018, 102]
    attention_mask = [1, 1, 1, 1, 1]
    batch_not_ok = {'input_ids': torch.Tensor(input_ids),
                    'attention_mask': torch.Tensor(attention_mask)}
    # Example of correct input shape for single-element batch:
    # batch_ok = {'input_ids': torch.Tensor([input_ids]),
    #             'attention_mask': torch.Tensor([attention_mask])}
    model = MagicMock()
    with pytest.raises(AssertionError):
        compute_vectors.vectorize_batch(batch_not_ok, model=model)
