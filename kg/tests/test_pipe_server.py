# FROM HERE DELETE
import numpy as np
import pandas as pd
import torch
from transformers import AutoModel, AutoTokenizer

import compute_vectors
from recommender import Recommender

DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
TRANSFORMER = AutoModel.from_pretrained(compute_vectors.MODEL_PATH).to(DEVICE)
TOKENIZER = AutoTokenizer.from_pretrained(compute_vectors.MODEL_PATH)
TOKENIZER_ARGS = dict(truncation=True, max_length=512)


def test_vectorize_diferent_batch_size(gen_inputs):
    inputs = gen_inputs
    rec = Recommender(
        vectors=np.zeros(1),
        dataset=pd.DataFrame(data=[1]),
        model=TRANSFORMER,
        tokenizer=TOKENIZER,
    )

    vec_1 = rec._compute_query_vector(inputs[0])
    vec_2 = rec._compute_query_vector(inputs[1])
    vec_3 = rec._compute_query_vector(inputs[2])
    vec_4 = rec._compute_query_vector(inputs[3])

    vecs_all = compute_vectors.vectorize(inputs,
                                         batch_size=4,
                                         model=TRANSFORMER,
                                         tokenizer=TOKENIZER,
                                         tokinzer_args=TOKENIZER_ARGS,
                                         device=DEVICE)

    assert np.allclose(vecs_all[0], vec_1)
    assert np.allclose(vecs_all[1], vec_2)
    assert np.allclose(vecs_all[2], vec_3)
    assert np.allclose(vecs_all[3], vec_4)
