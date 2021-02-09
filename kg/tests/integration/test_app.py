import pytest
from grpc_requests import StubClient

from src.proto.knowledge_graph_pb2 import DESCRIPTOR


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
        client = self.set_client()
        res = client.request("kg.KGService", "GetGraph", {"description": "test"})
        assert res == {'items': [{'id': 'test'}]}
