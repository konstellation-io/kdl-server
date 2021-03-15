import unittest
from unittest.mock import MagicMock

from description_evaluator import DescriptionEvaluator


class TestDescriptionEvaluatorWithMockedRecommender(unittest.TestCase):

    def setUp(self) -> None:
        mock_paper = MagicMock(score=0.8)
        top_items = MagicMock()
        top_items.__getitem__.return_value = mock_paper  # mocks last_item_score = float(top_items.items[-1].score)
        recommender = MagicMock()
        recommender.get_top_items.return_value = top_items

        self.evaluator = DescriptionEvaluator(recommender=recommender)

    def test_get_description_quality_returns_value_between_0_and_1(self):

        queries = ["This is my test query",
                   "A very long description " * 512]

        for query in queries:
            result = self.evaluator.get_description_quality(query)
            print(result)
            self.assertGreaterEqual(result, 0)
            self.assertLessEqual(result, 1)

    def test_get_description_quality_with_nonstring_input_raises_error(self):

        queries = [None, 3, True]
        for query in queries:
            with self.assertRaises(ValueError):
                self.evaluator.get_description_quality(description=query)

    def test_get_description_quality_with_empty_string_returns_zero(self):

        query = ""
        expect = 0
        result = self.evaluator.get_description_quality(description=query)

        self.assertEqual(expect, result)

    def test_get_description_quality_with_long_nonsense_string_returns_zero(self):

        query = "lkajsdo9erugnfklsdnfwporweournzksdf'sl;dfqwpsokwerpijrfowlds;wladkowwpfm3"
        expect = 0
        result = self.evaluator.get_description_quality(description=query)

        self.assertEqual(expect, result)


if __name__ == "__main__":

    unittest.main()
