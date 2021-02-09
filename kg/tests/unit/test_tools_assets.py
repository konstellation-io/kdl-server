from unittest.mock import Mock

import pytest
from tools.assets import AssetLoader


class TestAssetLoader:

    def test_asset_loader_mismatch_lengths(self):
        with pytest.raises(AssertionError):
            assets_mock = Mock()
            assets_mock.dataset = [1, 2, 3, 4]
            assets_mock.vectors = [1, 2, 3]

            AssetLoader._asset_checks(assets_mock)
