import pandas as pd
import pytest

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


class TestRecommenderIntegration:
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
        vec = vec.reshape(1, vec.shape[0])
        from scipy import spatial
        asset_vec = ASSETS.vectors[0].reshape(1, ASSETS.vectors.shape[1])
        distances = spatial.distance.cdist(vec, asset_vec, metric="cosine")
        assert distances[0][0] < 0.01
