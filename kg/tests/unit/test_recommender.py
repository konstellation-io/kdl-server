from unittest.mock import Mock

import numpy as np
import outputs
import pandas as pd
import pytest
import torch
from recommender import Recommender


class TestRecommender:

    def test_preprocess(self):
        query = "test\ninput"
        result = Recommender._preprocess(query)
        assert result == "test input"

    def test_compute_cosine_distances(self):
        v1 = np.array([[2, 1], [4, 1]])
        v2 = np.array([[2, 1], [66, 1]])
        distance = Recommender._compute_cosine_distances(v1, v2)
        assert isinstance(distance, np.ndarray)

        assert round(distance[1][1], 4) == 0.0263

    def test_computes_cosine_distances_zero(self):
        v1 = np.array([[2, 1], [4, 1]])
        v2 = np.array([[2, 1], [4, 1]])
        distance = Recommender._compute_cosine_distances(v1, v2)

        assert round(distance[1][1], 4) == 0

    def test_compute_cosine_distances_error(self):
        v1 = np.array([[2, 1], [4, 1]])
        v2 = np.array([[2, 1], [66]])
        with pytest.raises(IndexError):
            Recommender._compute_cosine_distances(v1, v2)

    def test_get_top_items(self):
        columns = ["id", "category", "title", "abstract", "authors", "score", "date", "url", "externalId", "framework"]
        data = [["1", "paper", "test title", "test abstract", "test author", 0, "2020-01-05", "http://test", "", ""]]
        test_dataset = pd.DataFrame(columns=columns, data=data)
        mock_recommender = Mock()
        mock_recommender._compute_query_vector.return_value = torch.tensor(np.random.rand(400, 1))
        mock_recommender._compute_cosine_distances.return_value = torch.tensor(np.random.rand(400, 1))
        mock_recommender.dataset = test_dataset
        papers = Recommender.get_top_items(mock_recommender, "test")
        assert isinstance(papers, outputs.RecommendedList)
        assert isinstance(papers.items[0], outputs.RecommendedItem)
        assert papers.items[0].title == "test title"
