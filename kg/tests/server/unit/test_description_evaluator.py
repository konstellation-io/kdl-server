from unittest.mock import MagicMock

import pytest

from description_evaluator import DescriptionEvaluator

MIN_WORDS = 10


@pytest.fixture
def description_evaluator():
    mock_paper = MagicMock(score=0.8)
    top_items = MagicMock()
    # mocks last_item_score = float(top_items.items[-1].score)
    top_items.items.__getitem__.return_value = mock_paper
    recommender = MagicMock()
    recommender.get_top_items.return_value = top_items

    evaluator = DescriptionEvaluator(recommender=recommender)

    return evaluator


class TestDescriptionEvaluatorWithMockedRecommender:

    def test_get_description_quality_returns_value_between_0_and_100(self, description_evaluator):
        queries = ["This is my test query",
                   "A very long description " * 512]

        for query in queries:
            result = description_evaluator.get_description_quality(query, MIN_WORDS)
            assert result >= 0
            assert result <= 100

    def test_get_description_quality_with_empty_string_returns_zero(self, description_evaluator):
        query = ""
        expect = 0
        result = description_evaluator.get_description_quality(description=query,
                                                               min_words=MIN_WORDS)

        assert expect == result

    def test_get_description_quality_with_long_nonsense_string_returns_zero(self, description_evaluator):
        query = "lkajsdo9erugnfklsdnfwporweournzksdf'sl;dfqwpsokwerpijrfowlds;wladkowwpfm3"
        expect = 0
        result = description_evaluator.get_description_quality(description=query,
                                                               min_words=MIN_WORDS)

        assert expect == result
