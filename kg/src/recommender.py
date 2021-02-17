import copy
import logging

import numpy as np
import pandas as pd
import torch
import transformers
from scipy import spatial

import outputs


class Recommender:
    """
    Recommender class initialized with a model, paper vectors an a dataframe of the papers dataset.

    Examples:
        r = Recommender(model=model,
                        tokenizer=tokenizer,
                        vectors=vectors,
                        dataset=dataset)
        list_of_papers = r.get_top_items("Lorem ipsum")
    """

    def __init__(
        self,
        model: transformers.PreTrainedModel,
        tokenizer: transformers.PreTrainedTokenizer,
        vectors: np.ndarray,
        dataset: pd.DataFrame,
    ):
        self.log = logging.getLogger("Recommender")
        self.log.info("Initializing Recommender")

        self.model = model
        self.tokenizer = tokenizer

        self.dataset = dataset
        self.vectors = vectors

        self.log.info("Recommender successfully loaded.")

    @staticmethod
    def _preprocess(text: str):
        """
        Preprocess given text for tokenization.
        """
        return text.replace("\n", " ")

    def _tokenize(self, text: str) -> transformers.BatchEncoding:
        """
        Tokenizes input text
        """
        tokens = self.tokenizer(text, truncation=True, max_length=512, return_tensors="pt")

        return tokens

    @staticmethod
    def _compute_cosine_distances(vectors_1: np.ndarray, vectors_2: np.ndarray) -> np.ndarray:
        """
        Computes pairwise cosine distances between vectors_1 (array) and vectors_2 (array).
        Args:
            vectors_1: numpy array representing
            the query vector shape(1, vector_dimensions).
            vectors_2: numpy array representing the
             dataset vectors shape(dataset_papers, vector_dimensions).
        Returns:
            distances: numpy array with the distance("relevance") between the
             input description and each paper. shape(1, dataset_papers)
        """
        assert (
            vectors_1.shape[1] == vectors_2.shape[1]
        ), "Vectors in the two input arrays should have the same number of dimensions"
        distances = spatial.distance.cdist(vectors_1, vectors_2, metric="cosine")

        return distances

    def _compute_query_vector(self, raw_query_text: str) -> torch.Tensor:
        """
        Computes a vector for a given query input.
        """
        self.log.debug(f"Computing vector for query text ('{raw_query_text[:120]}...'")

        processed_query = self._preprocess(raw_query_text)
        tokens = self._tokenize(processed_query)

        query_token_vecs = self.model(**tokens)[0].detach().squeeze()
        query_vector = torch.mean(query_token_vecs, dim=0)

        return query_vector

    def get_top_items(self, raw_query_text: str, n_hits: int = 1000) -> outputs.RecommendedList:
        """
        Gets top paper/repo matches for a given query text.
        """
        query_vec = self._compute_query_vector(raw_query_text)
        query_vec = query_vec.reshape(1, len(query_vec))

        distances = self._compute_cosine_distances(query_vec, self.vectors)

        df_subset = copy.copy(self.dataset)
        df_subset["score"] = distances[0]
        df_subset = df_subset.sort_values(by=["score"], ascending=True).head(n_hits)
        recommended_list = outputs.RecommendedList(list(df_subset.T.to_dict().values()))

        return recommended_list
