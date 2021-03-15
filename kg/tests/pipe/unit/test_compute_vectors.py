from collections import OrderedDict

# FROM HERE DELETE
import numpy as np
import torch
from faker import Faker
from torchnlp.encoders.text import stack_and_pad_tensors
from transformers import AutoModel, AutoTokenizer

import compute_vectors

# PATHS
ASSET_PATH = "assets/"
MODEL_PATH = ASSET_PATH + "model/"
OUTPUT_PATH = ASSET_PATH + "vectors.npy"

# CONSTANTS
VECTOR_DIMS = 768
BATCH_SIZE = 32

# Inputs and outputs
DATASET_PATH = ASSET_PATH + "dataset.pkl.gz"

TEST_DATASET_PATH = "tests/pipe/files/test_ds.pkl.gz"

DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

TOKENIZER = AutoTokenizer.from_pretrained(MODEL_PATH)
TOKENIZER_ARGS = dict(truncation=True, max_length=512)

TRANSFORMER = AutoModel.from_pretrained(MODEL_PATH).to(DEVICE)


# TO HERE


def gen_inputs(n_sentences: int = 10, n_paragraph: int = 5, n_inputs: int = 32) -> np.ndarray:
    locales = OrderedDict([('en-US', 1)])
    Faker.seed(0)
    fake = Faker(locales)
    outputs = list()
    for _ in range(n_inputs):
        description = ""
        for _ in range(n_paragraph):
            description += fake.paragraph(nb_sentences=n_sentences) + "\n"

        outputs.append(description)

    return np.array(outputs)


def test_convert_to_batches():
    items = np.arange(0, 309978)
    batches = compute_vectors.convert_to_batches(items, 32)

    assert len(batches) == 9687
    assert batches[1][0] == 32
    assert batches[-1][-1] == 309977


def test_tokenize_batch():
    inputs = gen_inputs(n_inputs=64)
    expected = stack_and_pad_tensors([torch.tensor(compute_vectors.TOKENIZER.encode(inputs[0],
                                                                                    **TOKENIZER_ARGS))],
                                     dim=512)
    batches = compute_vectors.convert_to_batches(inputs, batch_size=32)
    actual = compute_vectors.tokenize_batch(batches[0], tokenizer=TOKENIZER)

    assert all(actual[0] == expected[0])


def test_vectorize():
    inputs = gen_inputs(n_sentences=10, n_paragraph=5, n_inputs=32 * 2)
    vecs = compute_vectors.vectorize(inputs, batch_size=32, model=TRANSFORMER,
                                     tokenizer=TOKENIZER)


def test_vectorize_uneven_len():
    inputs = gen_inputs(n_sentences=10, n_paragraph=5, n_inputs=33)
    vecs = compute_vectors.vectorize(inputs, batch_size=32, model=TRANSFORMER,
                                     tokenizer=TOKENIZER)

    assert len(vecs) == 33


def test_preprocess_output():
    title = "Test Title"
    abstract = "This **is** ñ a test \n a test is this"
    expected = "Test Title. This  is  ñ a test   a test is this"
    output = compute_vectors.create_inputs(title, abstract)
    assert expected == output


def test_get_inputs():
    expected_first_input = "test title 0. test abstract 0"
    expected_last_input = "test title 63. test abstract 63"
    inputs = compute_vectors.get_inputs(TEST_DATASET_PATH)
    assert expected_first_input == inputs[0]
    assert expected_last_input == inputs[-1]
