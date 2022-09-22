# KDL Server helm chart

Installs KDL Server kubernetes manifests.

## Prerequisites

* Nginx ingress controller. See [Ingress Controller](#ingress-controller).
* MongoDB v4.2 database.
* Helm 3+

## Install chart

```bash
$ helm repo add konstellation-io https://kdl.konstellation.io
$ helm repo update
$ helm install [RELEASE_NAME] konstellation-io/kdl-server
```
*See [helm repo](https://helm.sh/docs/helm/helm_repo/) and [helm install](https://helm.sh/docs/helm/helm_install/) for command documentation.*

## Dependencies

* [MinIO](https://github.com/minio/minio/tree/master/helm/minio)
* [Jupyter Jupyter Enterprise Gateway](https://github.com/konstellation-io/enterprise_gateway)

## Uninstall chart

```bash
$ helm uninstall [RELEASE_NAME]
```

This removes all the Kubernetes components associated with the chart and deletes the release.

*See [helm uninstall](https://helm.sh/docs/helm/helm_uninstall/) for command documentation.*

## Upgrading Chart

### Upgrading an existing Release to a new major version

A major chart version change (like v0.15.3 -> v1.0.0) indicates that there is an incompatible breaking change needing
manual actions.

### From 5.X to 6.X
New requirements:
- An existing running MongoDB database must be accessible as internal MongoDB database has been removed. Check [MongoDB](#mongodb)

Changes in values:
- `mongodb` has been removed
- `global.mongodb.connectionString.uri`, `global.mongodb.connectionString.secretName` and `global.mongodb.connectionString.secretKey`

Execute the following actions to update the CRDs before applying the upgrade.
- Remove all `UserTools` resources from your cluster.
- Run the following command to update CRDs
```bash
kubectl apply --server-side -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v6.0.0/helm/kdl-server/crds/user-tools-operator-crd.yaml
```

### From 4.X to 5.X

Changes in values:
- `domain` moved to `global.domain`
- `serverName` moved to `global.serverName`
- `tls` moved to `global.ingress.tls`
- `cert-manager` has been removed. TLS certificate management has been lend to users own management. Use `global.tls.secretName` or `<component>.tls.secretName` to set the secret name containing the TLS certificate.
- Added `projectOperator.mlflow.ingress.annotations`, `projectOperator.mlflow.ingress.className`
- Added `drone.ingress.tls`, `gitea.ingress.tls`, `kdlServer.ingress.tls`, `minio.ingress.tls`, `minio.consoleIngress.tls`, `projectOperator.mlflow.ingress.tls` and `userToolsOperator.ingress.tls` for individual tls config. These values take precedence over `global.ingress.tls`.
- `drone.ingress.annotations.kubernetes.io/ingress.class: "nginx"` removed in favour of `drone.ingress.className: "nginx"`
- `gitea.ingress.annotations.kubernetes.io/ingress.class: "nginx"` removed in favour of `gitea.ingress.className: "nginx"`
- `kdlServer.ingress.annotations.kubernetes.io/ingress.class: "nginx"` removed in favour of `kdlServer.ingress.className: "nginx"`
- `minio.ingress.annotations.kubernetes.io/ingress.class: "nginx"` removed in favour of `minio.ingress.className: "nginx"`
- `minio.consoleIngress.annotations.kubernetes.io/ingress.class: "nginx"` removed in favour of `minio.consoleIngress.className: "nginx"`
- `userToolsOperator.ingress.annotations.kubernetes.io/ingress.class: "nginx"` removed in favour of `userToolsOperator.ingress.className: "nginx"`

Run these commands to update the CRDs before applying the upgrade.

```bash
kubectl apply --server-side --force-conflicts -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v5.0.0/helm/kdl-server/crds/user-tools-operator-crd.yaml
kubectl apply --server-side --force-conflicts -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v5.0.0/helm/kdl-server/crds/project-operator-crd.yaml
```

Existing `KDLProject` resources won't be updated with the new fields after upgrading the chart.

Run the following script to patch all existing `KDLProject` resources with the same ingress and TLS configuration for Mlflow that was defined in your release *values* (change variables values and set your custom annotations as convenience):

```bash
#!/bin/bash
NAMESPACE=<release_namespace>
INGRESS_CLASS=<ingress_class_name>
TLS_ENABLED=<true|false>
TLS_SECRET_NAME=<secret_name>

cat << EOF > patch-file.yaml
spec:
  mlflow:
    ingress:
      className: "${INGRESS_CLASS}"
      tls:
        enabled: ${TLS_ENABLED}
        secretName: "${TLS_SECRET_NAME}"
      annotations:
        # place your custom annotations here
EOF

for project in $(kubectl -n ${NAMESPACE} get kdlprojects.project.konstellation.io -o name); do kubectl -n ${NAMESPACE} patch ${project} --type merge --patch-file patch-file.yaml; done
rm -f patch-file.yaml
```

### From 3.X to 4.X

This major version comes with the following breaking changes:

- Fixed an issue with **usertools.kdl.konstellation.io** CRD that produced errors in **user-tools-operator** with *UserTools* resources during the reconciling process.
- Added `minio.consoleIngress.annotations` to *values.yaml*

Run these commands to update the CRDs before applying the upgrade.

```bash
kubectl apply --server-side -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v4.0.0/helm/kdl-server/crds/user-tools-operator-crd.yaml
```

### From 2.X to 3.X

This major version comes with the following breaking changes:

- Ingress configuration changed from *values.yaml*
    - removed `ingress.type`
    - added `drone.ingress.annotations`, `kdlApp.ingress.annotations`, `gitea.ingress.annotations`, `minio.ingress.annotations`, `userToolsOperator.ingress.annotations`

- Upgrade user-tools-operator to v0.20.0.
    - TLS secret name and Ingress annotations are now received from the operator values

- Upgrade app to 1.17.0
    - pass the name of the TLS secret and Ingress annotations through `userTools` resources.
    - pass Ingress annotations through `userTools`.

Run these commands to update the CRDs before applying the upgrade.

```bash
kubectl apply --server-side -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v3.0.0/helm/kdl-server/crds/user-tools-operator-crd.yaml
```

### From 1.X to 2.X

This major version comes with the following breaking changes:

- This upgrades user-tools-operator to v0.17.0.
    - users service accounts are now managed by `kdlServer` instead the `user-tools-operator`

Run these commands to update the CRDs before applying the upgrade.

```bash
kubectl apply --server-side -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v2.0.0/helm/kdl-server/crds/user-tools-operator-crd.yaml
```

### From 0.X to 1.X

This major version comes with the following breaking changes:

- UserTools CRD metadata changes:
    - `metadata.name` changed to `usertools.kdl.konstellation.io`
    - `spec.groups` changed to `kdl.konstellation.io`
- KDL Runtimes support

Run these commands to update the CRDs before applying the upgrade.

```bash
kubectl apply --server-side -f https://raw.githubusercontent.com/konstellation-io/kdl-server/v1.0.0/helm/kdl-server/crds/user-tools-operator-crd.yaml
```

## Chart customization
You can check all requirements and possible chart values [here](./CHART.md).

## Ingress controller

This Chart has been developed using **Nginx Ingress Controller**. So using the default ingress annotations ensures its correct operation. .

*See [values.yaml](values.yaml) file and [Nginx Ingress controller](https://kubernetes.github.io/ingress-nginx/) for additional documentation**.

However, users could use any other ingress controller (for example, [Traefik](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)). In that case, ingress configurations equivalent to the default ones must be povided.

Notice that even using equivalent ingress configurations the correct operation of the appliance is not guaranteed.

## MongoDB

To store existing **users**, **projects**, and **runtimes** data the KDL Server application needs and accessible MongoDB v4.2 database.

### Initial MongoDB configuration:

For a correct operation of the application the following MongoDB resources are required:

- `readWriteMinusDropRole` with the following configuration:
  - Allowed actions:
    - collStats
    - dbHash
    - dbStats
    - find
    - killCursors
    - listIndexes
    - listCollections
    - convertToCapped
    - createCollection
    - createIndex
    - dropIndex
    - insert
    - remove
    - renameCollectionSameDB
    - update
  - Allowed resources:
    - db: `kdl`
    - collection: `""`
- A user with the `root` and `readWriteMinusDropRole` roles associated.

Bellow we provide a JS script to easily setup the initial database configuration:

```js
conn = new Mongo();
db = conn.getDB("kdl");
try {
    db.createRole({
    role: "readWriteMinusDropRole",
    privileges: [
    {
        resource: { db: "kdl", collection: ""},
        actions: [ "collStats", "dbHash", "dbStats", "find", "killCursors", "listIndexes", "listCollections", "convertToCapped", "createCollection", "createIndex", "dropIndex", "insert", "remove", "renameCollectionSameDB", "update"]} ],
        roles: []
    }
    );
} catch (e) {
    print("Role for readWriteMinusDropRole for 'kdl' already exists")
}
try {
    db.createUser({user: "<username>", pwd: "<password>", roles: [{role: 'readWriteMinusDropRole', db: "kdl"}]})
} catch (e) {
    print("User <username> admin for 'kdl' database already exists")
}
```

Alternatively the following manifest can be used in case the [MongoDB Community Kubernetes Operator](https://github.com/mongodb/mongodb-kubernetes-operator) were installed in your Kubernetes cluster:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-admin-password
type: Opaque
data:
  adminPassword: {{ "123456" | b64enc | quote }}
---
apiVersion: mongodbcommunity.mongodb.com/v1
kind: MongoDBCommunity
metadata:
  name: mongodb-database
spec:
  members: 1
  type: ReplicaSet
  version: "4.2.8"
  security:
    authentication:
      modes: ["SCRAM"]
    roles:
    - role: readWriteMinusDropRole
      db: kdl
      privileges:
      - resource:
          db: kdl
          collection: ""
        actions:
        - collStats
        - dbHash
        - dbStats
        - find
        - killCursors
        - listIndexes
        - listCollections
        - convertToCapped
        - createCollection
        - createIndex
        - dropIndex
        - insert
        - remove
        - renameCollectionSameDB
        - update
      roles: []
  users:
  - name: admin
    db: admin
    passwordSecretRef:
      name: mongodb-admin-password
      key: adminPassword
    roles:
    - name: root
      db: admin
    - name: readWriteMinusDropRole
      db: kdl
    scramCredentialsSecretName: mongodb-admin
```
