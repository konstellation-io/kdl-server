"""
DescriptionEvaluator relies on a functioning Recommender, which is too heavy and slow to use in unit tests.
Therefore, this file contains tests for a functional integration between the DescriptionEvaluator and the
Recommender.
"""

import unittest
import pytest

import config
from tools.assets import AssetLoader
from recommender import Recommender
from description_evaluator import DescriptionEvaluator


class TestDescriptionEvaluatorWithTrueRecommender(unittest.TestCase):

    def setUp(self) -> None:
        assets = AssetLoader(config.ASSET_ROUTE)
        recommender = Recommender(
            model=assets.model,
            tokenizer=assets.tokenizer,
            vectors=assets.vectors,
            dataset=assets.dataset)

        self.evaluator = DescriptionEvaluator(recommender=recommender)

    @pytest.mark.int
    def test_get_description_quality_with_high_quality_description_returns_quality_above_50_percent(self):

        query = """The purpose of this project is to generate an algorithm for automated image quality enhancement.
            We have an extensive dataset of paired images of the same scene, in which one of the pair of images was
            taken with a high-end professional DSLR camera and another pair was taken with a mobile phone camera.
            On the basis of these paired images, we want to generate a neural network algorithm that is capable of
            enhancing the quality of any mobile phone photograph, irrespective of the optical properties of the
            source camera. We want the solution to achieve various aims, including denoising, color and contrast
            improvement and removal of Moire patterns."""
        result = self.evaluator.get_description_quality(description=query)

        self.assertGreaterEqual(result, 0.5)
