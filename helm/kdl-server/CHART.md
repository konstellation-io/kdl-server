# kdl-server

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://charts.min.io/ | minio | 3.2.0 |
| https://konstellation-io.github.io/enterprise_gateway/ | enterprise-gateway | 2.6.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| backup.activeDeadlineSeconds | int | `3600` | Sets the activeDeadlineSeconds param for the backup cronjob. Ref: https://kubernetes.io/docs/concepts/workloads/controllers/job/#job-termination-and-cleanup |
| backup.backoffLimit | int | `3` | Sets tge backoffLimit param for the backup cronjob. Ref: https://kubernetes.io/docs/concepts/workloads/controllers/job/#pod-backoff-failure-policy |
| backup.enabled | bool | `false` | Whether to enable backup |
| backup.extraVolumeMounts | list | `[]` | Extra volume mounts for backup pods |
| backup.extraVolumes | list | `[]` | Extra volumes for backup pods |
| backup.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| backup.image.repository | string | `"konstellation/kdl-backup"` | Image repository |
| backup.image.tag | string | `"0.22.0"` | Image tag |
| backup.name | string | `"backup-gitea"` | Name of the backup cronjob |
| backup.resources | object | `{"limits":{"cpu":"100m","memory":"256Mi"},"requests":{"cpu":"100m","memory":"100Mi"}}` | Resource requests and limits for backup container. Ref: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| backup.s3.awsAccessKeyID | string | `"aws-access-key-id"` | AWS Access Key ID for acceding backup bucket |
| backup.s3.awsSecretAccessKey | string | `"aws-secret-access-key"` | AWS Secret Access Key for acceding backup bucket |
| backup.s3.bucketName | string | `"s3-bucket-name"` | The S3 bucket that will store all backups |
| backup.schedule | string | `"0 1 * * 0"` | Backup cronjob schedule |
| cleaner.enabled | bool | `false` | Whether to enable cleaner cronjob |
| cleaner.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| cleaner.image.repository | string | `"konstellation/cleaner"` | The image repository |
| cleaner.image.tag | string | `"0.15.0"` | The image tag |
| cleaner.schedule | string | `"0 1 * * 0"` | Celaner cronjob schedule |
| cleaner.threshold | int | `5` | The minimun age of files to be removed |
| cleaner.trashPath | string | `"/shared-storage/.trash"` | The name of the trash path |
| drone.adminToken | string | `"7GSipOV0wJZQioZNBxaw3AotHV1tA4K4"` | Drone Server admin token |
| drone.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| drone.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| drone.image.repository | string | `"drone/drone"` | The image repository |
| drone.image.tag | string | `"1.10.1"` | The image tag |
| drone.ingress.annotations | object | `{"nginx.ingress.kubernetes.io/configuration-snippet":"more_set_headers \"Content-Security-Policy: frame-ancestors 'self' *\";\n","nginx.ingress.kubernetes.io/proxy-body-size":"100m"}` | Ingress annotations |
| drone.ingress.className | string | `"nginx"` | The ingress class name |
| drone.ingress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| drone.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| drone.pluginSecret | string | `"d97d8ee407af1002fa2449f578bb47a9"` | Provides the secret token used to authenticate http requests to the plugin endpoint |
| drone.rpcSecret | string | `"runner-shared-secret"` | Drone RPC secret for allowing Drone runners to authentiticate the RPC connection to the server |
| drone.runnerCapacity | int | `5` | The max number of concurrent jobs that a Drone runner can run |
| drone.storage.size | string | `"10Gi"` | Storage size |
| drone.storage.storageClassName | string | `"standard"` | The Storage ClassName |
| drone.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| droneAuthorizer.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| droneAuthorizer.image.repository | string | `"konstellation/drone-authorizer"` | The image repository |
| droneAuthorizer.image.tag | string | `"v0.13.5"` | The image tag |
| droneRunner.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| droneRunner.droneRunnerEnviron | string | `""` | Configures the DRONE_RUNNER_ENVIRON environment variable. Ref: https://docs.drone.io/runner/kubernetes/configuration/reference/drone-runner-environ/ |
| droneRunner.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| droneRunner.image.repository | string | `"drone/drone-runner-kube"` | The image repository |
| droneRunner.image.tag | string | `"1.0.0-beta.6"` | The image tag |
| droneRunner.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| droneRunner.serviceAccountJob.annotations | object | `{}` | If `.Values.droneRunner.serviceAccountJob.create` is set to `true`, sets annotations to the service account |
| droneRunner.serviceAccountJob.create | bool | `false` | If `.Values.droneRunner.serviceAccountJob.enabled` is set to `true`, creates the service account |
| droneRunner.serviceAccountJob.enabled | bool | `false` | Whether to enable the service account for Drone job pods |
| droneRunner.serviceAccountJob.name | string | `"drone-runner-job"` | The name of the Drone job service account |
| droneRunner.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| enterprise-gateway | object | Check [values.yaml](./values.yaml) | Jupyter Enterprise Gateway chart values. Check chart's [values.yaml](https://github.com/konstellation-io/enterprise_gateway/blob/main/etc/kubernetes/helm/enterprise-gateway/values.yaml) for a complete list of values |
| gitea.admin.email | string | `"test@test.com"` | Admin user email |
| gitea.admin.password | string | `"123456"` | Admin password |
| gitea.admin.username | string | `"kdladmin"` | Admin username |
| gitea.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| gitea.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| gitea.image.repository | string | `"gitea/gitea"` | The image repository |
| gitea.image.tag | string | `"1.14.4"` | The image tag |
| gitea.ingress.annotations | object | `{"nginx.ingress.kubernetes.io/configuration-snippet":"more_set_headers \"Content-Security-Policy: frame-ancestors 'self' *\";\n"}` | Ingress annotations |
| gitea.ingress.className | string | `"nginx"` | The ingress class name |
| gitea.ingress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| gitea.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| gitea.storage.size | string | `"10Gi"` | Storage size |
| gitea.storage.storageClassName | string | `"standard"` | Storage class name |
| gitea.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| giteaOauth2Setup.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| giteaOauth2Setup.image.repository | string | `"konstellation/gitea-oauth2-setup"` | The image repository |
| giteaOauth2Setup.image.tag | string | `"0.15.0"` | The image tag |
| global.domain | string | `"kdl.local"` | The DNS domain name that will serve the application |
| global.ingress.tls.caSecret | object | `{}` | A secret containing the the CA cert is needed in order to use a self-signed certificate. Check [values.yaml](./values.yaml) for usage details. |
| global.ingress.tls.enabled | bool | `true` | Whether to enable TLS |
| global.ingress.tls.secretName | string | If not defined, for each chart component that uses an ingress, an autogenerated secret name based on the `.Values.global.domain` and the component name will be used. Example: for gitea `kdl.local-gitea-tls` will be used | The name of the TLS secret to use for all ingresses. Specific component ingress secret names take precedence over this. |
| global.mongodb.connectionString.secretKey | string | `""` | If specfied in combination with `global.mongodb.secretName`, the name of the secret key that contains the MongoDB connection string. |
| global.mongodb.connectionString.secretName | string | `""` | If specified, the name of the secret that contains a key with the MongoDB connection string. |
| global.mongodb.connectionString.uri | string | `"mongodb+srv://admin:123456@example.com/admin?replicaSet=kdl-mongodb&ssl=false"` | MongoDB connection uri. This takes precedence over secretName and secretKey. `global.mongodb.secretName` in combination with `global.mongodb.secretKey` have precedence over this. |
| global.serverName | string | `"local-server"` | KDL Server instance name |
| kdlServer.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| kdlServer.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| kdlServer.image.repository | string | `"konstellation/kdl-server"` | The image repository |
| kdlServer.image.tag | string | `"1.26.0"` | The image tag |
| kdlServer.ingress.annotations | object | `{"nginx.ingress.kubernetes.io/proxy-body-size":"1000000m","nginx.ingress.kubernetes.io/proxy-connect-timeout":"3600","nginx.ingress.kubernetes.io/proxy-read-timeout":"3600","nginx.ingress.kubernetes.io/proxy-send-timeout":"3600"}` | Ingress annotations |
| kdlServer.ingress.className | string | `"nginx"` | The ingress class name |
| kdlServer.ingress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| kdlServer.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| kdlServer.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| knowledgeGalaxy.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| knowledgeGalaxy.config.descriptionMinWords | int | `50` | Minimum number of words to use for project description |
| knowledgeGalaxy.config.logLevel | string | `"INFO"` | Log level |
| knowledgeGalaxy.config.numberOfOutputs | int | `1000` | Number of outputs that the recommender returns |
| knowledgeGalaxy.config.workers | int | `1` | Number of threads for the server |
| knowledgeGalaxy.enabled | bool | `false` | Whether to enable Knowledge Galaxy |
| knowledgeGalaxy.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| knowledgeGalaxy.image.repository | string | `"konstellation/knowledge-galaxy"` | The image repository |
| knowledgeGalaxy.image.tag | string | `"v1.2.1"` | The image tag |
| knowledgeGalaxy.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| knowledgeGalaxy.serviceaccount.annotations | object | `{}` | The service account annotations |
| knowledgeGalaxy.serviceaccount.enabled | bool | `true` | Whether to create a service account |
| knowledgeGalaxy.serviceaccount.imagePullSecrets | list | `[]` | Reference to one or more secrets to be used when pulling images. Ref: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/ |
| knowledgeGalaxy.serviceaccount.name | string | knowledge-galaxy | The name of the service account to use |
| knowledgeGalaxy.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| minio | object | Check [values.yaml](./values.yaml) | MinIO chart's values. Check MinIO chart's [documentation](https://github.com/minio/minio/tree/master/helm/minio) for more info about values |
| minio.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| minio.consoleIngress.annotations | object | `{"nginx.ingress.kubernetes.io/proxy-body-size":"1000000m"}` | Ingress annotations |
| minio.consoleIngress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| minio.ingress.annotations | object | `{"nginx.ingress.kubernetes.io/proxy-body-size":"1000000m"}` | Ingress annotations |
| minio.ingress.className | string | `"nginx"` | The ingress class name |
| minio.ingress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| minio.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| minio.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| oauth2Proxy.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| oauth2Proxy.image.repository | string | `"quay.io/oauth2-proxy/oauth2-proxy"` | The image repository |
| oauth2Proxy.image.tag | string | `"v7.0.1-amd64"` | The image tag |
| postgres.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| postgres.dbName | string | `"gitea"` | The name of the Postgres database for Gitea |
| postgres.dbPassword | string | `"test"` | The password for the Gitea's database |
| postgres.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| postgres.image.repository | string | `"postgres"` | The image repository |
| postgres.image.tag | float | `12.1` | The image tag |
| postgres.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| postgres.storage.size | string | `"10Gi"` | The storage size for the persistent volume claim |
| postgres.storage.storageClassName | string | `"standard"` | Storage class to use for persistence |
| postgres.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| projectOperator.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| projectOperator.filebrowser.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| projectOperator.filebrowser.image.repository | string | `"filebrowser/filebrowser"` | The image repository |
| projectOperator.filebrowser.image.tag | string | `"v2"` | The image tag |
| projectOperator.kubeRbacProxy.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| projectOperator.kubeRbacProxy.image.repository | string | `"gcr.io/kubebuilder/kube-rbac-proxy"` | Image repository |
| projectOperator.kubeRbacProxy.image.tag | string | `"v0.8.0"` | Image tag |
| projectOperator.manager.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| projectOperator.manager.image.repository | string | `"konstellation/project-operator"` | The image repository |
| projectOperator.manager.image.tag | string | `"0.15.0"` | The image tag |
| projectOperator.manager.resources | object | `{}` | Resource requests and limits for primary projectOperator container. Ref: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| projectOperator.mlflow.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| projectOperator.mlflow.image.repository | string | `"konstellation/mlflow"` | The image repository |
| projectOperator.mlflow.image.tag | string | `"v0.13.5"` | The image tag |
| projectOperator.mlflow.ingress.annotations | object | `{}` | Ingress annotations |
| projectOperator.mlflow.ingress.className | string | `"nginx"` | The ingress class name |
| projectOperator.mlflow.ingress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| projectOperator.mlflow.volume.size | string | `"1Gi"` | The storage size for the persistent volume claim |
| projectOperator.mlflow.volume.storageClassName | string | `"standard"` | Storage class to use for persistence |
| projectOperator.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| projectOperator.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| sharedVolume.name | string | `"received-data"` | The name of the shared volume |
| sharedVolume.size | string | `"10Gi"` | The storage size for the persistent volume claim |
| sharedVolume.storageClassName | string | `"standard"` | Storage class to use for persistence |
| userToolsOperator.affinity | object | `{}` | Assign custom affinity rules. Ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ |
| userToolsOperator.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| userToolsOperator.image.repository | string | `"konstellation/user-tools-operator"` | The image repository |
| userToolsOperator.image.tag | string | `"0.24.0"` | The image tag |
| userToolsOperator.ingress.annotations | object | `{"nginx.ingress.kubernetes.io/configuration-snippet":"more_set_headers \"Content-Security-Policy: frame-ancestors 'self' *\";\n","nginx.ingress.kubernetes.io/proxy-body-size":"1000000m"}` | Ingress annotations |
| userToolsOperator.ingress.className | string | `"nginx"` | The ingress class name |
| userToolsOperator.ingress.tls.secretName | string | `nil` | The TLS secret name that will be used. It takes precedence over `.Values.global.ingress.tls.secretName`. |
| userToolsOperator.jupyter.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| userToolsOperator.jupyter.image.repository | string | `"konstellation/jupyter-gpu"` | The image repository |
| userToolsOperator.jupyter.image.tag | string | `"v0.15.0"` | The image tag |
| userToolsOperator.kubeconfig.enabled | bool | `false` | Whether to enable kubeconfig for using with VSCode remote development. Ref: https://code.visualstudio.com/docs/remote/remote-overview |
| userToolsOperator.kubeconfig.externalServerUrl | string | `""` | The Kube API Server URL for using with VSCode remote development |
| userToolsOperator.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. Ref: https://kubernetes.io/docs/user-guide/node-selection/ |
| userToolsOperator.oauth2Proxy.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| userToolsOperator.oauth2Proxy.image.repository | string | `"quay.io/oauth2-proxy/oauth2-proxy"` | The image repository |
| userToolsOperator.oauth2Proxy.image.tag | string | `"v7.0.1-amd64"` | The image tag |
| userToolsOperator.repoCloner.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| userToolsOperator.repoCloner.image.repository | string | `"konstellation/repo-cloner"` | The image repository |
| userToolsOperator.repoCloner.image.tag | string | `"0.15.0"` | The image tag |
| userToolsOperator.storage.size | string | `"10Gi"` | The storage size for the persistent volume claim |
| userToolsOperator.storage.storageClassName | string | `"standard"` | Storage class to use for persistence |
| userToolsOperator.tolerations | list | `[]` | If specified, the pod's tolerations. Ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ |
| userToolsOperator.vscode.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| userToolsOperator.vscode.image.repository | string | `"konstellation/vscode"` | The image repository |
| userToolsOperator.vscode.image.tag | string | `"v0.15.0"` | The image tag |
| userToolsOperator.vscodeRuntime.image.pullPolicy | string | `"IfNotPresent"` | The image pull policy |
| userToolsOperator.vscodeRuntime.image.repository | string | `"konstellation/kdl-py"` | The image repository |
| userToolsOperator.vscodeRuntime.image.tag | string | `"3.9"` | The image tag |
