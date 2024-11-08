# runtimes

**runtime** is a container for data science and machine learning applications to be used in `KDL` and `KRE` projects. A **runtime** refers to a pre-configured containerized environment, equipped with the tools, libraries, and dependencies which data scientists need to develop, test and deploy models.

> [!TIP]
> Read the [konstellation-runtimes](https://github.com/konstellation-io/konstellation-runtimes) repository for more information.

## How-to create a new `runtime`

> [!IMPORTANT]
> If you are creating a new runtime, make sure that the `name` is not already in use, because it will be used as a unique identifier.

This is the JSON schema to add new `runtime` to the `runtimes` collection in the `kdl` MongoDB database:

```json
{
  "name": "<name>",
  "desc": "<description>",
  "labels": ["label1", "labelN"],
  "docker_image": "<repository/image>",
  "docker_tag": "<tag-image>"
}
```

> [!TIP]
> All images are in this [konstellation/kdl-py](https://hub.docker.com/repository/docker/konstellation/kdl-py/general) registry.

## How-to add `runtimes` to the MongoDB

Add `port-forward` on MongoDB pod:

```bash
kubectl -n <namespace> port-forward svc/<mongo-svc> 27017:27017
```

Connect MongoDB instance:

```bash
mongosh --port 27017 --username <username> --authenticationDatabase admin --password <password>
```

Use the `kdl` database:

```bash
use kdl
```

Insert `runtimes`:

> [!NOTE]
> Example of a runtime for `Python 3.10 CPU workloads`.

```bash
db.runtimes.insertOne({
  "name" : "Python 3.10 CPU - 1.4.3",
  "desc" : "Rumtime with Python 3.10 for CPU workloads",
  "labels" : [
      "Python 3.10",
      "Ubuntu 22.04",
      "CPU"
  ],
  "docker_image" : "konstellation/kdl-py",
  "docker_tag" : "3.10-cuda11.8.0-runtime-ubuntu22.04-1.2.2"
})
```
