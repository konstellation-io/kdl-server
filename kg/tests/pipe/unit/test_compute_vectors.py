import numpy as np
import torch

import compute_vectors

TEST_DATASET_PATH = "tests/pipe/files/test_ds.pkl.gz"

INPUT_TEST = """Extremity direction existence as dashwoods do up. Securing marianne led welcomed offended but
            offering six raptures. Conveying concluded newspaper rapturous oh at. Two indeed suffer saw beyond
            far former mrs remain. Occasional continuing possession we insensible an sentiments as is.
            Law but reasonably motionless principles she. Has six worse downs far blush rooms above stood.
            Certainly elsewhere my do allowance at. The address farther six hearted hundred towards husband.
            Are securing off occasion remember daughter replying. Held that feel his see own yet. Strangers
            ye to he sometimes propriety in. She right plate seven has. Bed who perceive judgment did marianne.
            Gave read use way make spot how nor. In daughter goodness an likewise oh consider at procured wandered.
            Songs words wrong by me hills heard timed. Happy eat may doors songs.
            Be ignorant so of suitable dissuade weddings together. Least whole timed we is.
            An smallness deficient discourse do newspaper be an eagerness continued.
            Mr my ready guest ye after short at.
            Received overcame oh sensible so at an. Formed do change merely to county it.
            Am separate contempt domestic to to oh.
            On relation my so addition branched."""

INPUT_TEST_2 = """Put hearing cottage she norland letters equally prepare too.
            Replied exposed savings he no viewing as up. Soon body add him hill.
            No father living really people estate if. Mistake do produce beloved demesne if am pursuit.
            Is post each that just leaf no. He connection interested so we an sympathize advantages.
            To said is it shed want do. Occasional middletons everything so to. Have spot part for his quit may.
            Enable it is square my an regard. Often merit stuff first oh up hills as he.
            Servants contempt as although addition dashwood is procured.
            Interest in yourself an do of numerous feelings cheerful confined.
            Resources exquisite set arranging moonlight sex him household had. Months had too ham cousin remove far spirit.
            She procuring the why performed continual improving. Civil songs so large shade in cause.
            Lady an mr here must neat sold. """


def test_convert_to_batches():
    items = np.arange(0, 309978)
    batches = compute_vectors.convert_to_batches(items, 32)

    assert len(batches) == 9687
    assert batches[1][0] == 32
    assert batches[-1][-1] == 309977


def test_tokenize_batch():
    expected = torch.tensor(compute_vectors.TOKENIZER.encode(INPUT_TEST,
                                                             **compute_vectors.TOKENIZER_ARGS))
    batch = (INPUT_TEST, INPUT_TEST_2)
    actual = compute_vectors.tokenize_batch(batch)
    assert all(actual[0] == expected)


def test_vectorize_batch():
    pass


def test_vectorize():
    compute_vectors.vectorize([INPUT_TEST, INPUT_TEST_2], 1)


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
