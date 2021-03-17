from collections import OrderedDict

import numpy as np
import pytest
from faker import Faker


@pytest.fixture
def gen_inputs(n_sentences: int = 10, n_paragraph: int = 3, n_inputs: int = 4) -> np.ndarray:
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
