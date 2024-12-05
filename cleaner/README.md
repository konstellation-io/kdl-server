# KDL Cleaner

In order to manage huge amount of files in the KDL trainings, instead of remove the
datasets, these are copied to a `./trash` folder within the persistent shared volume. This way
we are sure that if some dataset are removed by a mistake can be recovered, but also we can
handle some performance issue with the process of delete a huge amount of files in a NFS shared
volume.

With this approach in mind is required to clean this `./trash` folder with the deleted datasets. In order to achieve that there are a cron job which schedule is defined
from the custom `values.yaml` to deploy the KDL Helm Chart. Also it is posible to set
the minimun age of the datasets to be deleted, to keep a threshold of time to allow recover those.

## Cleaner CLI

The script to perform the cleaning task is a Golang CLI with the below options

```bash
$ ./cleaner -h
Usage of ./cleaner:
  -debug
        Set debug mode to get more detailed log of deleted files.
  -path string
        Specify the root path of the trash folder to be cleaned. (default "./.trash")
  -threshold duration
        The minimum age of the items to be removed. (default 120h0m0s)
```

## OCI image

This CLI is packaged as OCI image in order to be run in a scheduled cronjob within KDL.

To build the OCI image run the below command.

```bash
docker build -t konstellation/cleaner:latest .
```

## Build

```bash
go build -o cleaner .
```

## Run tests

```console
go test ./... --tags=integration,unit -v -cover
```

Run only unit tests

```console
go test ./... -tags=unit -v -cover
```

Run only integration tests

```console
go test ./... -tags=integration -v -cover
```
