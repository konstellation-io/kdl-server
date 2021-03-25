import pytest
from scipy.spatial.distance import cdist
import torch
from transformers import AutoModel, AutoTokenizer

import compute_vectors

# DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
DEVICE = torch.device("cpu")
TRANSFORMER = AutoModel.from_pretrained(compute_vectors.MODEL_PATH).to(DEVICE)
TOKENIZER = AutoTokenizer.from_pretrained(compute_vectors.MODEL_PATH)
TOKENIZER_ARGS = dict(truncation=True, max_length=512)


@pytest.mark.int
def test_tokenize_batch_produces_batch_with_attention_masks_and_input_ids(gen_inputs):
    """
    Tests that the outputs of tokenize_batch match the expectations for downstream usage by the transformer model.
    """
    inputs = gen_inputs
    n_inputs = len(inputs)

    batch_of_tokens = compute_vectors.tokenize_batch(
        inputs, tokenizer=TOKENIZER, tokenizer_args=TOKENIZER_ARGS, device=DEVICE)

    # Check that tokens batch object contains 'input_ids' and 'attention_mask'
    message_batch_components = "'{}' not found in tokenize_batch outputs. Check the tokenizer is called with " \
        "tokenizer(inputs) rather than tokenizer.encode(inputs)"

    assert 'input_ids' in batch_of_tokens.keys(), message_batch_components.format("input_ids")
    assert 'attention_mask' in batch_of_tokens.keys(), message_batch_components.format("attention_mask")

    # Check that tokens batch components are tensors, or at least implement the size attribute
    message_size_attr = ".size attribute is required for passing tokens to the transformer. " \
        "Check that tokenizer is called with return_tensors='pt'."

    assert hasattr(batch_of_tokens['input_ids'], 'size'), message_size_attr
    assert hasattr(batch_of_tokens['attention_mask'], 'size'), message_size_attr

    # Check that the batch dimensions are as expected
    message_expected_dims = "Outputs of tokenize_batch do not match expected format."

    assert batch_of_tokens['input_ids'].size()[0] == n_inputs, message_expected_dims
    assert batch_of_tokens['attention_mask'].size()[0] == n_inputs, message_expected_dims


# @pytest.mark.int
def test_vectorize_batch_outputs_are_not_affected_by_padding_tokens():
    """
    Padding tokens, even when accompanied by an attention mask, have a surprising effect on the document vector.
    They do not affect the vectors of non-pad tokens, but the pad tokens do get their own vectors calculated too
    and by default they would get included in the computation of the document vector, thereby corrupting it.
    This is prevented by a loop in vectorize_batch which applies the masks separately for each document.
    """
    input_ids = torch.tensor([[101, 4905, 2855, 4018, 102]], dtype=torch.int64, device=DEVICE)
    attention_mask = torch.tensor([[1, 1, 1, 1, 1]], dtype=torch.int64, device=DEVICE)

    input_ids_padded = torch.tensor([[101, 4905, 2855, 4018, 102, 0, 0, 0, 0]], dtype=torch.int64, device=DEVICE)
    attention_mask_padded = torch.tensor([[1, 1, 1, 1, 1, 0, 0, 0, 0]], dtype=torch.int64, device=DEVICE)

    model = TRANSFORMER.to(DEVICE)

    vec_simple = compute_vectors.vectorize_batch(
        batch={'input_ids': input_ids, 'attention_mask': attention_mask}, model=model)

    vec_padded = compute_vectors.vectorize_batch(
        batch={'input_ids': input_ids_padded, 'attention_mask': attention_mask_padded}, model=model)

    # Check element-wise distances:
    assert torch.allclose(vec_simple, vec_padded, atol=10e-6)   # Reasonable floating point tolerance is needed

    # Check cosine distances:
    assert cdist(vec_simple, vec_padded, metric='cosine') < 10e-9


# @pytest.mark.int
# def test_vectorize_outputs_do_not_depend_on_batch_size(gen_inputs):
#
#
#     VECTORIZE_ARGS = dict(model=TRANSFORMER,
#                           tokenizer=TOKENIZER,
#                           tokenizer_args=TOKENIZER_ARGS,
#                           device=DEVICE)
#     inputs = gen_inputs
#
#     vecs_all = compute_vectors.vectorize(inputs, batch_size=4, **VECTORIZE_ARGS)
#
#     vec_1 = compute_vectors.vectorize([inputs[0]], batch_size=1, **VECTORIZE_ARGS)
#     vec_2 = compute_vectors.vectorize([inputs[1]], batch_size=1, **VECTORIZE_ARGS)
#     vec_3 = compute_vectors.vectorize([inputs[2]], batch_size=1, **VECTORIZE_ARGS)
#     vec_4 = compute_vectors.vectorize([inputs[3]], batch_size=1, **VECTORIZE_ARGS)
#
#     assert np.allclose(vecs_all[0], vec_1)
#     assert np.allclose(vecs_all[1], vec_2)
#     assert np.allclose(vecs_all[2], vec_3)
#     assert np.allclose(vecs_all[3], vec_4)


#
# @pytest.mark.int
# def test_tokenize_batch(gen_inputs):
#     inputs = gen_inputs
#     tensor = torch.tensor(TOKENIZER.encode(inputs[0], **TOKENIZER_ARGS))
#     expected = compute_vectors.stack_and_pad_tensors([tensor], TOKENIZER.pad_token_id)
#     batches = compute_vectors.convert_to_batches(inputs, batch_size=32)
#     actual = compute_vectors.tokenize_batch(batches[0], tokenizer=TOKENIZER,
#                                             tokenizer_args=TOKENIZER_ARGS, device=DEVICE)
#     assert torch.allclose(actual[0], expected[0])
#     assert torch.allclose(actual[1], expected[1])
#
#

# @pytest.mark.int
# def test_vectorize_batch_size(gen_inputs):
#     inputs = gen_inputs
#     vecs = compute_vectors.vectorize(inputs, batch_size=4, model=TRANSFORMER,
#                                      tokenizer=TOKENIZER,
#                                      tokenizer_args=TOKENIZER_ARGS,
#                                      device=DEVICE)
#     first_vec = compute_vectors.vectorize(np.array([inputs[0]]), batch_size=1, model=TRANSFORMER,
#                                           tokenizer=TOKENIZER,
#                                           tokenizer_args=TOKENIZER_ARGS,
#                                           device=DEVICE)
#     assert np.allclose(vecs[0], first_vec[0])
#
#




