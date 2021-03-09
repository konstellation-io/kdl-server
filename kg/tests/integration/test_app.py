"""
You have to set up a server to run these tests:
```
python server/app.py
```
"""

import pandas as pd
import pytest
from grpc_requests import StubClient

import config
from proto.knowledge_graph_pb2 import DESCRIPTOR, GetGraphRes
from tools.assets import AssetLoader


def get_cases_from_load_dataset(n: int = 1) -> pd.DataFrame:
    return AssetLoader(config.ASSET_ROUTE).dataset.head(n)


class TestKnowledgeGraphService:

    @staticmethod
    def set_client() -> StubClient:
        service_descriptor = DESCRIPTOR.services_by_name["KGService"]
        return StubClient.get_by_endpoint("localhost:5555", service_descriptors=[service_descriptor])

    @pytest.mark.int
    def test_services(self):
        client = self.set_client()
        assert client.service_names == ["kg.KGService"]

    @pytest.mark.int
    def test_GetGraph(self):
        case = get_cases_from_load_dataset(1)
        client = self.set_client()
        res = client.request("kg.KGService", "GetGraph",
                             {"description": case.abstract.iloc[0]},
                             raw_output=True)
        assert isinstance(res.__class__, type(GetGraphRes))
        assert res.items[0].external_id == case.external_id.iloc[0]
