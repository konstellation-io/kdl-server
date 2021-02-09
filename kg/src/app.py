import logging
from concurrent import futures

import grpc

import config
import proto.knowledge_graph_pb2 as kg_pb2
import proto.knowledge_graph_pb2_grpc as kg_grpc_pb2
from assets import AssetsLoader
from recommender import Recommender


class KnowledgeGraphService(kg_grpc_pb2.KGServiceServicer):
    """
    Main gRPC Knowledge Graph service, this is an implementation from proto files schemas.
    """

    def __init__(self):
        self.log = logging.getLogger("KGApp")
        assets = AssetsLoader(config.ASSET_ROUTE)
        self.recommender = Recommender(assets.model, assets.vectors, assets.dataset)

    def GetGraph(self, request: kg_pb2.GetGraphReq, context: grpc.ServicerContext) -> kg_pb2.GetGraphRes:
        self.log.debug(f"Input description:\n {request.description}")
        recommended_items = self.recommender.get_top_items(request.description, n_hits=config.N_HITS)
        self.log.debug(f"Output items:\n {recommended_items}")
        return recommended_items.to_grpc()

    def __repr__(self):
        return self.__class__.__name__


class Server:
    """
    Server class for the KnowledgeGraph Service.
    """

    def __init__(self, service, host: str = config.HOST, port: int = config.PORT, workers: int = config.WORKERS):
        self.log = logging.getLogger("KGServer")
        self.host = host
        self.port = port
        self.service = service
        self.workers = workers
        self.server = self.set_up()

    def set_up(self) -> grpc.Server:
        """
        Auxiliary function that setup the gRPC server.
        """
        grpc_server = grpc.server(futures.ThreadPoolExecutor(max_workers=self.workers))
        kg_grpc_pb2.add_KGServiceServicer_to_server(self.service(), grpc_server)
        address = f"{self.host}:{self.port}"
        # TODO maybe fix this once dockerized
        grpc_server.add_insecure_port(address)

        return grpc_server

    def start(self):
        """
        Starts the gRPC server.
        """
        self.log.info(
            f"Starting service: {self.service} server with {self.workers} workers on {self.host}:{self.port}")
        self.server.start()
        self.server.wait_for_termination()

    def stop(self):
        """
        Stops the gRPC server
        """
        self.server.stop(30)


if __name__ == "__main__":
    server = Server(KnowledgeGraphService)
    try:
        server.start()
    except KeyboardInterrupt:
        server.stop()
