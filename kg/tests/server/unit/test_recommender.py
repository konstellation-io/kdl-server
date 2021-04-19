from unittest.mock import Mock

import numpy as np
import pandas as pd
import pytest

import outputs
from recommender import Recommender, split_text_into_chunks


class TestRecommender:

    def test_preprocess_new_line_removal(self):
        query = "test\ninput"

        result = Recommender._preprocess(query)

        assert result == "test input"

    def test_compute_score(self):
        result = Recommender._compute_scores(0.1)
        assert 0.95 == round(result, 2)

    def test_get_top_items(self):
        columns = ["id",
                   "category",
                   "title",
                   "abstract",
                   "authors",
                   "distance",
                   "date",
                   "topics",
                   "url",
                   "externalId",
                   "framework"]

        data = [["1",
                 "paper",
                 "test title",
                 "test abstract",
                 "test author",
                 0.5,
                 "2020-01-05",
                 [outputs.Topic("name", 0.1)],
                 "http://test",
                 "",
                 ""]]

        test_dataset = pd.DataFrame(columns=columns, data=data)

        mock_recommender = Mock()
        mock_recommender._compute_query_vector.return_value = np.random.rand(768).astype("float32")
        mock_recommender.vectors.search.return_value = (np.random.randint(1, 100, size=1), np.random.rand(1, 768))
        mock_recommender.dataset = test_dataset

        papers = Recommender.get_top_items(mock_recommender, "test")

        assert isinstance(papers, outputs.RecommendedList)
        assert papers.items[0].title == "test title"


class TestSplitTextIntoChunks:
    """ split_text_into_chunks is required for chunking those descriptions that are too long for the model limit
    (currently max 512 tokens), in order to process description chunks in batches instead. Tests in this class
    check its expected behaviour.
    """

    def test_split_text_into_chunks_with_expected_inputs(self):
        """
        Simple happy-path tests
        """
        input_text = 'This is a sequence with approximately, or perhaps exactly 11 words.'

        chunks_2 = split_text_into_chunks(text=input_text, n_chunks=2)
        expect_2 = ['This is a sequence with approximately,', 'or perhaps exactly 11 words.']
        assert chunks_2 == expect_2

        chunks_3 = split_text_into_chunks(text=input_text, n_chunks=3)
        expect_3 = ['This is a sequence', 'with approximately, or perhaps', 'exactly 11 words.']
        assert chunks_3 == expect_3

        chunks_4 = split_text_into_chunks(text=input_text, n_chunks=4)
        expect_4 = ['This is a', 'sequence with approximately,', 'or perhaps exactly', '11 words.']
        assert chunks_4 == expect_4

        chunks_6 = split_text_into_chunks(text=input_text, n_chunks=6)
        expect_6 = ['This is', 'a sequence', 'with approximately,', 'or perhaps', 'exactly 11', 'words.']
        assert chunks_6 == expect_6

    def test_split_text_into_chunks_with_too_many_chunks_raises_error(self):
        """
        In the context of the recommender in particular, it makes no sense to allow chunking text into more chunks
        than there are words.
        """
        input_text = "A short example description."  # 4 words only, but we will try to split into 6 chunks
        with pytest.raises(AssertionError):
            split_text_into_chunks(text=input_text, n_chunks=6)
