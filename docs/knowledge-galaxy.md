# Knowledge Galaxy

This is an external tool for data scientist that can be integrated into KDL. [Read more](https://github.com/konstellation-io/knowledge-galaxy) about it.

To enable the integration follow these steps:

- Enable `Knowledge Galaxy` in `helm/values.yaml` with a config like this:

```yaml
knowledgeGalaxy:
  enabled: true
```

- Create a secret named `regcred` with the docker credential needed in order to download the private image:

```bash
kubectl create secret docker-registry regcred \
  --docker-username=$DOCKER_USERNAME          \
  --docker-password=$DOCKER_AUTH_TOKEN        \
  --dry-run=client -o yaml | kubectl -n kdl apply -f -
```

- Set the name imagePullSecret name in the `knowledgeGalaxy` config:

```yaml
knowledgeGalaxy:
  enabled: true
  ...
  serviceaccount:
    ...
    imagePullSecrets:
      - regcred
```

## Local environment

To work with a local version of knowledge galaxy, edit your `.kdlctl.conf` file with the following information:

```bash
export KNOWLEDGE_GALAXY_LOCAL=true
export KNOWLEDGE_GALAXY_PATH=<path/to/local/knowledge-galaxy>
```

This will trigger a build whenever you use `kdlctl.sh` script.
