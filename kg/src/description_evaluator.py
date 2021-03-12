import numpy as np

import config
from recommender import Recommender
from tools.assets import AssetLoader


class DescriptionEvaluator(object):

    def __init__(self, recommender : Recommender) -> None:
        self.recommender = recommender

    @staticmethod
    def convert_score_to_quality(score: float) -> float:
        a = 2.5    # estimated empirically, see notebook 18
        b = -1.25  # ibid
        quality = a * score + b
        quality = np.clip(quality, a_min=0, a_max=1)

        return quality

    def get_description_quality(self, description: str) -> float:

        if not isinstance(description, str):
            raise ValueError("`get_description_quality` expected a string input.")

        n_words = len(description.split())

        if n_words < 10:
            return 0

        else:
            rec_list = self.recommender.get_top_items(description, n_hits=100)
            last_item_score = float(rec_list.items[-1].score)
            quality = self.convert_score_to_quality(last_item_score)
            return quality


if __name__ == "__main__":
    # TODO: Remove main and move example to tests
    # Set up recommender to inject into DescriptionEvaluator
    assets = AssetLoader(config.ASSET_ROUTE)
    recommender = Recommender(
        model=assets.model,
        tokenizer=assets.tokenizer,
        vectors=assets.vectors,
        dataset=assets.dataset)

    # Instantiate the DescriptionEvaluator and get description quality
    de = DescriptionEvaluator(recommender=recommender)
    example_descr = "A test query for some machine learning project using image classification. "
    estimated_quality = de.get_description_quality(example_descr)
    print("Description quality:", estimated_quality)
