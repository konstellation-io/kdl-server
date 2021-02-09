from dataclasses import dataclass, fields

import proto.knowledge_graph_pb2 as kg_pb


@dataclass(init=False, order=False)
class RecommendedItem:
    id: str
    category: str
    title: str
    abstract: str
    authors: str
    score: str
    date: str
    url: str
    externalId: str = ""
    framework: str = ""

    def __init__(self, field_dict):
        self.fields = self._get_fields()
        self.mandatory_fields = self._get_mandatory_fields()

        # Checks that all required fields are present
        if not set(self.mandatory_fields).issubset(field_dict.keys()):
            missing_fields = set(field_dict).difference(self.mandatory_fields)
            raise Exception(f"Missing mandatory fields: {missing_fields}")

        for key, value in field_dict.items():
            if key not in self.fields:
                continue
            setattr(self, key, value)

    def _get_fields(self) -> list[str]:
        return [field.name for field in fields(self)]

    def _get_mandatory_fields(self):
        return [field.name for field in fields(self) if field.default is None]

    def to_grpc(self) -> kg_pb.GraphItem:
        item = kg_pb.GraphItem()
        for field in self.fields:
            setattr(item, field, getattr(self, field))

        return item

    # Order methods
    def __eq__(self, other):
        return self.score == other.score

    def __gt__(self, other):
        return self.score > other.score

    def __lt__(self, other):
        return self.score < other.score

    def __ge__(self, other):
        return self.score >= other.score

    def __le__(self, other):
        return self.score <= other.score


@dataclass(init=False)
class RecommendedList:
    items: list[RecommendedItem]

    def __init__(self, entry: list[dict]):
        item_list = list()
        for item in entry:
            item_list.append(RecommendedItem(item))

        self.items = item_list
        self.items.sort()

    def to_grpc(self) -> kg_pb.GetGraphRes:
        res = kg_pb.GetGraphRes()
        res.items.extend([item.to_grpc() for item in self.items])

        return res
