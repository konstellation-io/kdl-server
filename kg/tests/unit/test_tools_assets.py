from unittest.mock import Mock

import numpy as np
import pandas as pd
import pytest

from exceptions import AssetLoadingException
from tools.assets import AssetLoader


class TestAssetLoader:

    def test_asset_loader(self):
        assets_mock = Mock()
        assets_mock.dataset = pd.DataFrame(data=[1, 2, 3, 4])
        assets_mock.vectors = np.array([1, 2, 3, 4])

        AssetLoader._asset_checks(assets_mock)

    def test_asset_loader_mismatch_lengths(self):
        with pytest.raises(AssetLoadingException):
            assets_mock = Mock()
            assets_mock.dataset = pd.DataFrame(data=[1, 2, 3, 4])
            assets_mock.vectors = np.ndarray([1, 2, 3])

            AssetLoader._asset_checks(assets_mock)
