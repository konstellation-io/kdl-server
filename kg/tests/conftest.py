import sys
from collections import OrderedDict
from pathlib import Path
from typing import List

import pytest
from faker import Faker

pipe = Path(Path.cwd(), 'src/pipe')
server = Path(Path.cwd(), 'src/server')
sys.path.append(str(pipe))
sys.path.append(str(server))


@pytest.fixture
def gen_inputs(n_sentences: int = 5, n_paragraph: int = 2, n_inputs: int = 4) -> List[str]:
    """Creates garbled texts that can be used as inputs for testing tokenization and vectorization tasks"""
    locales = OrderedDict([('en-US', 1)])
    Faker.seed(0)
    fake = Faker(locales)
    outputs = list()
    for _ in range(n_inputs):
        description = ""
        for _ in range(n_paragraph):
            description += fake.paragraph(nb_sentences=n_sentences) + "\n"

        outputs.append(description)

    return outputs
