import sys

import pandas as pd
import pytest

sys.path.append("/home/marc.vivancos/Test/kdl-server/kg/src")

import config
from tools.assets import AssetLoader

from recommender import Recommender

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
    def test_recommender_get_top_items_data(self):
        """
        This tests the integration of the assets with the recommender
        errors in this test can be errors with the dataset, models, vectors...

        Given text of any abstract from the dataset as inputs to the recommender
        the recommender should return the same paper as the top hits with an expected
        high score(> 98)
        """
        cases = self.get_cases_from_load_dataset(10)
        for idx, abstract in enumerate(cases.abstract):
            hits = RECOMMENDER.get_top_items(abstract)
            # This assumes the results are in order as they should
            assert cases.iloc[idx].abstract == abstract
            top_ids = [item.id for item in hits.items if item.score > 0.98]
            assert cases.iloc[idx].id in top_ids
