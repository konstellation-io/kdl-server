import numpy as np

from pipe import utils

TEST_DATASET_PATH = "tests/files/test_ds.pkl.gz"


def test_convert_to_batches():
    items = np.arange(0, 309978)
    batches = utils.convert_to_batches(items, 32)
    assert len(batches) == 9687
    assert batches[1][0] == 32
    assert batches[-1][-1] == 309977


def test_preprocess_output():
    title = "Test Title"
    abstract = "This **is** ñ a test \n a test is this"
    expected = "Test Title. This  is  ñ a test   a test is this"
    output = utils.create_inputs(title, abstract)
    assert expected == output


def test_get_inputs():
    expected_first_input = "title paper 0. abstract 0"
    expected_last_input = "title paper 9. abstract 9"
    inputs = utils.get_inputs(TEST_DATASET_PATH)
    assert expected_first_input == inputs[0]
    assert expected_last_input == inputs[-1]
