# Knowledge Galaxy gRPC server and data pipeline

## Project Structure

```bash
├── assets     # Output assets directory.
├── inputs     # Input datasets.
├── proto      # Protobufer schemas
├── scripts    # Utility scripts for the project.
├── src        # Sourcecode folder
│   ├── pipe   # Code for data/model generation.
│   └── server # Code for gRPC server code
└── tests      # Test directory
    ├── files  # Auxiliary file folder
    ├── pipe   # Test for data generation pipeline
    └── server # Test for grpc server
```
## Installation

### Faiss
For the creation of the vector asset we use Faiss which is hard to install
you can follow the instructions to build from source [here](https://github.com/facebookresearch/faiss/blob/master/INSTALL.md#building-from-source).

Then you have to move the resulting build code to the site-packages of the python version
where you want to use it.

### Caveats with PyTorch versions
The current installed version is a gpu+cpu version if you have any problems with your environment change the version
to cpu only.

### Local Installation
- [Install pyenv](https://github.com/pyenv/pyenv#installation) to manage python versions
- Install python version 3.9.1 ```pyenv install 3.9.1```
- Set local python version ```pyenv local 3.9.1```
- Install pipenv ```pip install pipenv```
- Install dependencies ```pipenv install --dev```
- Move the faiss build code to the virtualenv i.e.:
  ```
  cp -r build/faiss/python/build/lib/faiss ~/.local/share/virtualenvs/kdl-server/lib/python3.9/site-packages
  ```

## Generate protobuf code
To generate the golang and python code you have to run the following script:
```bash
# from kg directory
bash scripts/generate_proto.sh
```

## Asset download
You have to install [dvc](https://dvc.org/doc/install) or be inside the project virtualenv

After that you have to run the following command:

```bash
dvc pull
```

### Testing and linters

#### Unit tests

To run the unit tests you have to install the development dependencies:

```bash
pipenv install --dev
```

and then run:

```bash
pipenv run python -m pytest -m "not int"
```

#### Linting and Type Checking

To check the code quality run the following tools

```bash
# flake8 checks code conventions (pep8...) and code style, docs...
flake8

# mypy is not fully fuctional but it's useful, it simulates static typing
mypy [file-to-analyze]
```

#### Integration tests

To run the integration tests you have to set up a server:

```bash
pipenv run python src/server/app.py
```

and then run:

```bash
pipenv run python -m pytest int
```
