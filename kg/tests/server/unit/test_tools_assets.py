from unittest.mock import Mock

import pandas as pd
import pytest

from exceptions import AssetLoadingException
from tools.assets import AssetLoader


class TestAssetLoader:

    def test_asset_loader(self):
        assets_mock = Mock()
        index_mock = Mock()
        index_mock.ntotal = 4
        assets_mock.dataset = pd.DataFrame(data=[1, 2, 3, 4])
        assets_mock.vectors = index_mock

        AssetLoader._asset_checks(assets_mock)

    def test_asset_loader_mismatch_lengths(self):
        with pytest.raises(AssetLoadingException):
            assets_mock = Mock()
            index_mock = Mock()
            index_mock.ntotal = 5
            assets_mock.dataset = pd.DataFrame(data=[1, 2, 3, 4])
            assets_mock.vectors = index_mock

            AssetLoader._asset_checks(assets_mock)
