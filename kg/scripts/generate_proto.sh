#!/bin/sh

pipenv run python -m grpc_tools.protoc -Iproto/ --python_out=src/proto \
    --mypy_out=src/proto --grpc_python_out=src/proto \
    --mypy_grpc_out=src/proto knowledge_graph.proto
protoc --go_out=../app/api/infrastructure/kgservice/ \
    --go_opt=paths=source_relative \
    --go-grpc_out=../app/api/infrastructure/kgservice/ \
    --go-grpc_opt=paths=source_relative proto/knowledge_graph.proto
