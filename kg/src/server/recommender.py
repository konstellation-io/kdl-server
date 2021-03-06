import copy
import logging
import math

import faiss
import numpy as np
import pandas as pd
import torch
import transformers
from pipe.compute_vectors import tokenize_batch, vectorize_batch

from outputs import RecommendedList
from topics import get_relevant_topics


def split_text_into_chunks(text: str, n_chunks: int) -> list[str]:
    """
    Given input text that is too long to process in one go (e.g. longer than the limit of 512 tokens),
    it splits the input string into the specified number of non-overlapping chunks, each containing a similar
    number of words.

    Why is this performed on the level of text rather than tokens? If done on level of tokens, it would require
    manual handling of start- and end-of-sequence tokens, and also splitting attention masks in parallel with
    splitting the tokens, which brings in more moving parts and more room for error.

    Args:
        text: input string to split into shorter sections
        n_chunks: number of sections to split into

    Returns:
        (list of str)
    """
    words = text.split()
    n_words = len(words)
    words_per_chunk = int(np.ceil(n_words / n_chunks))
    assert n_chunks < n_words

    first_in_chunk = list(range(0, n_words, int(words_per_chunk)))

    chunks = [" ".join(words[i * words_per_chunk:int(min(i * words_per_chunk + words_per_chunk, n_words))])
              for i, start in enumerate(first_in_chunk)]

    return chunks


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
        vectors: faiss.IndexFlatL2,
        dataset: pd.DataFrame,
    ):
        self.log = logging.getLogger("Recommender")
        self.log.info("Initializing Recommender")

        self.model = model
        self.tokenizer = tokenizer
        self.max_tokens = self.model.config.max_position_embeddings

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
        tokens = self.tokenizer(text, return_tensors="pt")
        self.log.info(f"tokens shape: {tokens['input_ids'].shape}")
        return tokens

    def _compute_query_vector(self, raw_query_text: str) -> np.ndarray:
        """
        Computes a vector for a given query input.
        """
        self.log.debug(f"Computing vector for query text ('{raw_query_text[:120]}...'")
        device = self.model.device  # To make computation device-agnostic; wherever the model is, tensors will go

        processed_query = self._preprocess(raw_query_text)
        tokens = self._tokenize(processed_query)
        n_tokens = len(tokens['input_ids'][0])

        if n_tokens <= self.tokenizer.model_max_length:
            query_token_vecs = self.model(input_ids=tokens['input_ids'].to(device),
                                          attention_mask=tokens['attention_mask'].to(device))[0].detach().squeeze()
            query_vector = torch.mean(query_token_vecs, dim=0).cpu().numpy().astype("float32")

        else:
            query_chunks = split_text_into_chunks(raw_query_text, n_chunks=np.ceil(n_tokens / self.max_tokens))
            tokens_by_chunk = tokenize_batch(query_chunks, tokenizer=self.tokenizer, device=device,
                                             tokenizer_args={})
            vecs_by_chunk = vectorize_batch(tokens_by_chunk, model=self.model)
            query_vector = torch.mean(vecs_by_chunk, dim=0).cpu().numpy().astype("float32")

        return query_vector

    @staticmethod
    def _compute_scores(distance: float, shift: float = 0.75, scale: int = 20) -> float:
        """
        Computes a score from the cosine distance of the vectors.
        Args:
            distance: distance between specific paper and description.
        Returns:
            score: converted score
        """
        return 1 / (1 + math.exp(scale * (distance - 1 + shift)))

    def get_top_items(self, raw_query_text: str, n_hits: int = 1000) -> RecommendedList:
        """
        Gets top paper/repo matches for a given query text.
        """
        query_vec = self._compute_query_vector(raw_query_text)
        query_vec = query_vec.reshape(1, len(query_vec))

        faiss.normalize_L2(query_vec)

        similarity, idxs = self.vectors.search(query_vec, k=n_hits)
        df_subset = copy.copy(self.dataset.iloc[idxs[0].tolist()])
        df_subset["similarity"] = similarity[0]
        # Transform similarity to distance
        df_subset["distance"] = df_subset.similarity.apply(lambda x: 1 - x)

        df_subset["score"] = df_subset.distance.apply(self._compute_scores)

        recommended_list = RecommendedList(list(df_subset.T.to_dict().values()))
        relevant_topics = get_relevant_topics(df_subset.topics)
        recommended_list.add_topics(relevant_topics)

        return recommended_list
