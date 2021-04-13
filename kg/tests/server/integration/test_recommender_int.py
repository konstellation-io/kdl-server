import numpy as np
import pandas as pd
import pytest
from scipy import spatial

import config
from recommender import Recommender
from tools.assets import AssetLoader

ASSETS = AssetLoader(config.ASSET_ROUTE)
RECOMMENDER = Recommender(
    model=ASSETS.model,
    tokenizer=ASSETS.tokenizer,
    vectors=ASSETS.vectors,
    dataset=ASSETS.dataset,
)


class TestRecommenderDataIntegration:
    @staticmethod
    def get_cases_from_load_dataset(n: int = 1) -> pd.DataFrame:
        return ASSETS.dataset.head(n=n)

    @pytest.mark.int
    def test_recommender_get_top_items_int(self):
        """
        This tests the integration of the assets with the recommender
        errors in this test can be errors with the dataset, models, vectors...

        Given text of any abstract from the dataset as inputs to the recommender
        the recommender should return the same paper as the top hits with an expected
        high score(> 98)
        """
        cases = self.get_cases_from_load_dataset(10)
        for idx, case in cases.iterrows():
            query = f"{case.title}. {case.abstract}".replace("\n", " ").replace("**", " ")
            hits = RECOMMENDER.get_top_items(query)
            # This assumes the results are in order as they should
            assert cases.iloc[idx].abstract == case.abstract
            top_ids = [item.external_id for item in hits.items if item.score > 0.95]
            assert case.external_id in top_ids

    @pytest.mark.int
    def test_compute_query_vector_distance_integration(self):
        """
        This tests the integration of the assets with the recommender
        errors in this test can be errors with the dataset, models, vectors...

        Given text of any abstract from the dataset as inputs to the recommender
        the recommender should return the same paper as the top hits with an expected
        high score(> 98)
        """
        case = self.get_cases_from_load_dataset(1).iloc[0]
        query = f"{case.title}. {case.abstract}".replace("\n", " ").replace("**", " ")
        vec = RECOMMENDER._compute_query_vector(query)
        import faiss
        vec = vec.reshape(1, vec.shape[0])
        faiss.normalize_L2(vec)
        dist, idx = ASSETS.vectors.search(vec, k=2)
        assert idx[0][0] == 0
        assert dist[0][0] - 1 < 0.01


class TestRecommenderHandlingLongDescriptions:

    @pytest.mark.int
    def test_description_parts_after_512_tokens_are_not_ignored(self):
        """
        The model that we are using is limited by its architecture to process text sequences up
        to 512 tokens long. The common solution and the default behaviour beyond 512 tokens is to simply
        truncate the input to the length of 512 tokens and ignore the rest. However, this introduces a
        problem: a user may write a long project description, and spend time on improving the description
        beyond the length of 512 tokens, only to find that the outputs did not change at all compared to a
        previous shorter description, wasting time. To avoid this pitfall, we require a way of processing long
        descriptions (most obviously by computing embeddings by parts and combining them together). Irrespective
        of the implementation, this test assures that tokens beyond the 512th token do affect the computed query
        vector.

        WARNING: Takes a long time to execute on CPU (20+ seconds)
        """
        description_512 = "This is a short description. " * 85  # A description that contains exactly 512 tokens.
        extension = "A project about computer vision, aerial image segmentation and object detection."
        description_longer = description_512 + extension

        vec_512 = RECOMMENDER._compute_query_vector(description_512)
        vec_longer = RECOMMENDER._compute_query_vector(description_longer)

        vector_dim = RECOMMENDER.model.config.dim
        distance = spatial.distance.cdist(vec_512.reshape(1, vector_dim),
                                          vec_longer.reshape(1, vector_dim),
                                          metric='cosine')[0, 0]

        assert distance > 10e-3
        assert not np.allclose(vec_longer, vec_512)
