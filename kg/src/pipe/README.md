# Data pipeline:

## Structure
![pipeline](pipeline.svg)

## Run data/asset creation:
You have to install [dvc](https://dvc.org/doc/install) and then run to reproduce the full data pipeline:
```
dvc repro
```

The pipeline consists of the following steps:
```
check-inputs
create-dataset
compute-vectors
compute-topics
```

You can rerun an specific step with the following command:
```
dvc repro [step-name]
```
