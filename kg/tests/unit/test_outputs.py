from outputs import RecommendedItem


class TestRecommendedItem:

    def test_creation(self):
        test_values = {"id": "12345",
                       "category": "paper",
                       "title": "title test",
                       "abstract": "test abastract",
                       "authors": "test author",
                       "score": 0.1,
                       "date": "2020-01-01",
                       "url": "http://test"}
        item = RecommendedItem(test_values)

        assert test_values['id'] == item.id
        assert test_values['score'] == item.score
        assert isinstance(item.score, float)

    def test_creation_missing_fields(self):
        test_values = {"id": "12345",
                       "category": "paper",
                       "score": 0.1,
                       "date": "2020-01-01"}

        item = RecommendedItem(test_values)

    def test_get_fields(self):
        pass

    def test_get_mandatory_fields(self):
        pass

    def test_creation_wrong_type(self):
        pass

    def test_order(self):
        pass

    def test_to_grpc(self):
        pass


class TestRecommendedList:

    def test_creation(self):
        pass

    def test_to_grpc(self):
        pass
