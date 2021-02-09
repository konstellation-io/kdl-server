from dataclasses import asdict, dataclass, fields

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
        for key, value in field_dict.items():
            if key not in self.fields():
                continue
            setattr(self, key, value)

    def fields(self) -> list[str]:
        return [field.name for field in fields(self)]

    def mandatory_fields(self):
        return [field.name for field in fields(self) if field]

    def to_grpc(self) -> kg_pb.GraphItem:
        item = kg_pb.GraphItem()
        for field in self.fields():
            setattr(item, field, getattr(self, field))

        return item

    # Magic methods for order and iteration
    def __iter__(self):
        return iter(asdict(self))

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
