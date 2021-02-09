import logging
from pathlib import Path

import numpy as np
import pandas as pd
import transformers


class AssetLoader:

    def __init__(self, path: str):
        self.log = logging.getLogger("AssetLoader")
        self.path = path
        self.dataset = self._load_dataset()
        self.model = self._load_model()
        self.vectors = self._load_dataset_vectors()
        self._asset_checks()

    def _asset_checks(self):
        if not len(self.dataset) == len(self.vectors):
            message = f"The specified dataset (n={len(self.dataset)}) " \
                      f"and the vectors (available for {len(self.vectors)} documents) do not match. " \
                      "Please check the inputs."
            raise AssertionError(message)

    def _load_dataset(self) -> pd.DataFrame:
        """
        Loads the dataset from the filepath specified in object attributes.
        For current usage, this must be identical to the training set on which self.model was trained on.
        """
        path = Path(self.path, "dataset.csv")
        self.log.debug(f"Loading dataset from: {path}")
        df = pd.read_csv(path, dtype={'id': str})
        return df

    def _load_dataset_vectors(self) -> np.ndarray:
        path = Path(self.path, "vectors.npy")
        self.log.debug(f"Loading vectors from: {path}")
        return np.load(str(path))

    def _load_model(self) -> transformers.PreTrainedModel:
        """
        Loads a Transformer model object from a file.
        """
        path = Path(self.path, "model")
        self.log.debug(f"Loading model from: {path}")
        model = transformers.AutoModel.from_pretrained(path)
        return model
