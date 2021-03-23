import copy
import logging
from concurrent import futures

import grpc

import config
import proto.knowledge_graph_pb2 as kg_pb2
import proto.knowledge_graph_pb2_grpc as kg_grpc_pb2
from description_evaluator import DescriptionEvaluator
from outputs import RecommendedItem
from recommender import Recommender
from tools.assets import AssetLoader


class KnowledgeGraphService(kg_grpc_pb2.KGServiceServicer):
    """
    Main gRPC Knowledge Graph service, this is an implementation from proto files schemas.
    """

    def __init__(self):
        self.log = logging.getLogger("KnowledgeGraphService")
        self.assets = AssetLoader(config.ASSET_ROUTE)
        self.recommender = Recommender(
            model=self.assets.model,
            tokenizer=self.assets.tokenizer,
            vectors=self.assets.vectors,
            dataset=self.assets.dataset,
        )
        self.evaluator = DescriptionEvaluator(self.recommender)

    def GetGraph(self, request: kg_pb2.GetGraphReq, context: grpc.ServicerContext) -> kg_pb2.GetGraphRes:
        self.log.debug(f"Input description:\n {request.description}")
        recommended_items = self.recommender.get_top_items(
            request.description, n_hits=config.N_HITS
        )
        self.log.debug(f"Output items:\n {recommended_items}")

        return recommended_items.to_grpc()

    def GetItem(self, request: kg_pb2.GetItemReq, context: grpc.ServicerContext) -> kg_pb2.GetItemRes:
        match = self.assets.dataset.loc[self.assets.dataset['id'] == request.id]
        if match.id.count() == 0:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            item = None
        else:
            # Setting fields for messaging format
            res_item = copy.copy(match)
            res_item['score'] = 0.0
            item = RecommendedItem(res_item.iloc[0].to_dict()).to_grpc()

        res = kg_pb2.GetItemRes(item=item)

        return res

    def GetDescriptionQuality(self, request: kg_pb2.DescriptionQualityReq, context: grpc.ServicerContext):
        description_score = self.evaluator.get_description_quality(request.description)
        res = kg_pb2.DescriptionQualityRes(quality_score=description_score)

        return res

    def __repr__(self):
        return self.__class__.__name__


class Server:
    """
    Server class for the KnowledgeGraph Service.
    """

    def __init__(
        self,
        service,
        host: str = config.HOST,
        port: int = config.PORT,
        workers: int = config.WORKERS,
    ):
        self.log = logging.getLogger("Server")
        self.host = host
        self.port = port
        self.service = service
        self.workers = workers
        self.grpc = self.set_up()

    def set_up(self) -> grpc.Server:
        """
        Auxiliary function that setup the gRPC server.
        """
        grpc_server = grpc.server(futures.ThreadPoolExecutor(max_workers=self.workers))
        kg_grpc_pb2.add_KGServiceServicer_to_server(self.service(), grpc_server)
        address = f"{self.host}:{self.port}"
        grpc_server.add_insecure_port(address)

        return grpc_server

    def start(self):
        """
        Starts the gRPC server.
        """
        self.log.info(
            f"Starting service: {self.service} server with {self.workers} workers on {self.host}:{self.port}"
        )
        self.grpc.start()
        self.grpc.wait_for_termination()

    def stop(self):
        """
        Stops the gRPC server
        """
        self.grpc.stop(30)


if __name__ == "__main__":
    server = Server(KnowledgeGraphService)
    try:
        server.start()
    except KeyboardInterrupt:
        server.stop()
