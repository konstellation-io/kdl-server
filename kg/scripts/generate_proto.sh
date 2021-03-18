#!/bin/sh

pipenv run python -m grpc_tools.protoc -Iproto/ --python_out=server/proto \
    --mypy_out=server/proto --grpc_python_out=server/proto \
    --mypy_grpc_out=server/proto knowledge_graph.proto
protoc --go_out=../app/api/infrastructure/kgservice/ \
    --go_opt=paths=source_relative \
    --go-grpc_out=../app/api/infrastructure/kgservice/ \
    --go-grpc_opt=paths=source_relative proto/knowledge_graph.proto
