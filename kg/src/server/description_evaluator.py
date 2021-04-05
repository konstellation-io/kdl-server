import numpy as np

from recommender import Recommender


class DescriptionEvaluator(object):
    """
    Class for evaluating the project description quality.

    Methods:
        - get_description_quality
        - _convert_score_to_quality

    Example usage:

        # Set up recommender to inject into DescriptionEvaluator
        import config
        from tools.assets import AssetLoader

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
    """
    def __init__(self, recommender: Recommender):
        self._recommender = recommender

    @staticmethod
    def _convert_score_to_quality(score: float) -> int:
        """Computes the estimated quality based on score of a paper """
        a = 2.5
        b = -1.25
        quality = a * score + b
        quality = round(np.clip(quality, a_min=0, a_max=1) * 100)

        return quality

    def get_description_quality(self, description: str, min_words: int) -> int:
        """Given a project description string, returns estimated description quality based on the
        scores of the highly-ranked papers returned by the recommender (including top-100 papers).

        Args:
          description: (str) input project description
          min_words: (int) minimum number of words to start counting.

        Returns:
            (int) estimated description quality percentage
        """
        if len(description.split()) < min_words:
            return 0

        top_items = self._recommender.get_top_items(description, n_hits=100)
        last_item_score = top_items.items[-1].score
        quality = self._convert_score_to_quality(last_item_score)

        return quality
