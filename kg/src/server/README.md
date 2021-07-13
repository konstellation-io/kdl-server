# Server
## Configuration
Most of the configuration is done through environment variables:
```bash
# Mandatory
KG_ASSET_ROUTE="/home/assets" # Asset route this is a mandatory variable

# Server Settings
KG_WORKERS=1 # Number of threads for the server defaults to 1
KG_HOST="localhost" # Address for the server defaults to localhost
KG_PORT=5555 # KG server port defaults to 5555

# Recommender Settings
KG_N_HITS=1000 # Number of outputs that the recommender outputs defaults to 1000

# Log file
KG_LOG_FILE="/var/log/kg.log" # Log file path defaults to /var/log/kg.log
KG_LOG_LEVEL="INFO" # Log level defaults to info
```

## Run server

###
```
pipenv run python src/server/app.py
```

to run in microk8s create dev environment:
```
kdlctl.sh dev
```

## Requests to the server
To use this examples you will have to install [grpcurl](https://github.com/fullstorydev/grpcurl)
```
grpcurl -import-path .. -proto knowledge_graph.proto \
 -plaintext -d '{"description": "test"}'\
 localhost:5555 kg.KGService.GetGraph
```
