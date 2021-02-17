import pytest

from exceptions import MissingFieldException
from outputs import RecommendedItem, RecommendedList
from proto.knowledge_graph_pb2 import GetGraphRes, GraphItem

VALUES_1 = {"id": "12345",
            "category": "paper",
            "title": "title test 1",
            "abstract": "test abstract",
            "authors": "test author",
            "score": 0.1,
            "date": "2020-01-01",
            "url": "http://test"}

VALUES_2 = {"id": "6789",
            "category": "paper",
            "title": "title test 2",
            "abstract": "test abstract 2",
            "authors": "test author 2",
            "score": 0.2,
            "date": "2020-01-01",
            "url": "http://test"}

VALUES_EXTRA = {"id": "6789",
                "category": "paper",
                "title": "title test 2",
                "abstract": "test abstract 2",
                "authors": "test author 2",
                "score": 0.2,
                "date": "2020-01-01",
                "url": "http://test",
                "extraField": "extra"}

VALUES_OPTIONAL = {"id": "6789",
                   "category": "paper",
                   "title": "title test 2",
                   "abstract": "test abstract 2",
                   "authors": "test author 2",
                   "score": 0.2,
                   "date": "2020-01-01",
                   "url": "http://test",
                   "framework": "pytorch",
                   "external_id": "arxivId"}

VALUES_MISSING = {
    "id": "12435"
}


class TestRecommendedItem:

    def test_creation(self):
        item = RecommendedItem(VALUES_1)
        assert VALUES_1['id'] == item.id
        assert VALUES_1['score'] == item.score
        assert isinstance(item.score, float)

    def test_creation_unnecessary_fields(self):
        item = RecommendedItem(VALUES_EXTRA)
        with pytest.raises(AttributeError):
            item.extraField

    def test_creation_optional_fields(self):
        item = RecommendedItem(VALUES_OPTIONAL)
        assert item.framework == "pytorch"
        assert item.external_id == "arxivId"

    def test_creation_missing_fields(self):
        with pytest.raises(MissingFieldException):
            RecommendedItem(VALUES_MISSING)

    def test_get_fields(self):
        expected_fields = ['id',
                           'category',
                           'title',
                           'abstract',
                           'authors',
                           'score',
                           'date',
                           'url',
                           'external_id',
                           'framework']
        fields = RecommendedItem(VALUES_1)._get_fields()
        assert isinstance(fields, list)
        assert fields == expected_fields

    def test_get_mandatory_fields(self):
        expected_fields = ['id',
                           'category',
                           'title',
                           'abstract',
                           'authors',
                           'score',
                           'date',
                           'url']
        fields = RecommendedItem(VALUES_1)._get_mandatory_fields()
        assert isinstance(fields, list)
        assert fields == expected_fields

    def test_order(self):
        item1 = RecommendedItem(VALUES_1)
        item2 = RecommendedItem(VALUES_2)
        assert item2 >= item1
        assert item2 != item1

    def test_to_grpc(self):
        item = RecommendedItem(VALUES_1)
        item_proto = item.to_grpc()
        assert isinstance(item_proto, GraphItem)
        assert item_proto.title == "title test 1"


class TestRecommendedList:

    def test_creation(self):
        rec_list = RecommendedList([VALUES_2, VALUES_1])
        assert len(rec_list.items) == 2
        assert rec_list.items[0].title == "title test 1"

    def test_to_grpc(self):
        rec_list = RecommendedList([VALUES_2, VALUES_1]).to_grpc()
        assert isinstance(rec_list, GetGraphRes)
        assert isinstance(rec_list.items[0], GraphItem)
