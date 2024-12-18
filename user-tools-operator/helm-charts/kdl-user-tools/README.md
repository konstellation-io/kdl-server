# kdl-usertools

A Helm chart to deploy KDL usertools

## Description

This Helm chart deploys the core components of a Kubernetes Data Lab (KDL) project, providing essential tools for data scientists and machine learning engineers in a Kubernetes-native environment. Overview The KDL Project chart creates a complete development environment for data science and machine learning workflows.

## How works

### Default values

`values.yaml` its contains all the default configurations for the core services of a KDL project, specifically MLflow and Filebrowser:

* Resource allocations
* Security configurations
* Network policies
* Storage settings
* Service ports and endpoints

### Overriding values from `kdl-server` Helm chart

`kdl-server`` Helm chart, which is the main deployment chart, has the power to override these default values. When kdl-server deploys, can provide its own values that take precedence over the defaults.

For example, if the default values specify:

```yaml
  replicaCount: 1
  resources:
    limits:
      memory: "128Mi"
```

The `kdl-server` chart might override these with:

```yaml
mlflow:
  replicaCount: 2
  resources:
    limits:
      memory: "256Mi"
```

This override mechanism is particularly powerful because it allows for environment-specific configurations while maintaining a consistent base configuration. The project operator, which is included in the kdl-server deployment, uses these final merged values when creating and managing KDL projects.

## Components

### Filebrowser

A modern web-based file manager that provides:

* Secure file access and management through a web interface
* User authentication and authorization
* File operations (upload, download, modify) with persistence
* Integration with Kubernetes storage systems

### MLflow

A platform for the machine learning lifecycle that offers:

* Experiment tracking and management
* Model registry and versioning
* Integration with various ML frameworks
* Artifact storage with MinIO/S3 compatibility
* Metric visualization and comparison

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| ialejandro | <ivan.alejandro@intelygenz.com> |  |
| alpiquero | <angelluis.piquero@intelygenz.com> |  |
| danielchg | <daniel.chavero@intelygenz.com> |  |

## Prerequisites

* Helm 3+
* Kubernetes 1.26+

## CI values

Go to [ci](./ci) directory to see some examples of how to use this chart.

```console
helm template test . -f ci/ci-values.yaml
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity |
| autoscaling | object | `{"enabled":false,"maxReplicas":100,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | Autoscaling with CPU or memory utilization percentage </br> Ref: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/ |
| domain | string | `"kdl.local"` | String to set domain to deploy |
| extraContainers | list | `[]` | Configure extra containers |
| fullnameOverride | string | `""` | String to fully override kdl-user-tools.fullname template |
| imagePullSecrets | list | `[]` | Specifies the secrets to use for pulling images from private registries Leave empty if no secrets are required E.g. imagePullSecrets:   - name: myRegistryKeySecretName |
| initContainers | list | `[{"command":["sh","/generate-kubeconfig.sh"],"image":"alpine/k8s:1.31.2","imagePullPolicy":"IfNotPresent","name":"create-kubeconfig","volumeMounts":[{"mountPath":"/home/coder","name":"data"},{"mountPath":"/kubeconfig.tpl","name":"kubeconfig-tpl-configmap","subPath":"kubeconfig.tpl"},{"mountPath":"/generate-kubeconfig.sh","name":"kubeconfig-tpl-configmap","subPath":"generate-kubeconfig.sh"}]},{"command":["sh","-c","mkdir -p /home/kdl/.ssh && chown 1000:1000 /home/kdl/.ssh"],"image":"busybox:stable","imagePullPolicy":"IfNotPresent","name":"create-ssh-folder","volumeMounts":[{"mountPath":"/home/kdl","name":"data"}]}]` | Configure additional containers </br> Ref: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ |
| kubeconfig | object | `{"enabled":false}` | If enabled, users will be able to download a kubeconfig file, so they can attach an external terminal/IDE to the vscodeRuntime running inside. |
| nameOverride | string | `""` | String to partially override kdl-user-tools.fullname template (will maintain the release name) |
| networkPolicy | object | `{"egress":[],"enabled":false,"ingress":[],"policyTypes":[]}` | NetworkPolicy configuration </br> Ref: https://kubernetes.io/docs/concepts/services-networking/network-policies/ |
| networkPolicy.enabled | bool | `false` | Enable or disable NetworkPolicy |
| networkPolicy.policyTypes | list | `[]` | Policy types |
| nodeSelector | object | `{}` | Node labels for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector |
| persistentVolume | object | `{"accessModes":["ReadWriteOnce"],"annotations":{},"enabled":true,"labels":{},"selector":{},"size":"1Gi","storageClass":"","volumeBindingMode":""}` | Persistent Volume configuration </br> Ref: https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| persistentVolume.accessModes | list | `["ReadWriteOnce"]` | Persistent Volume access modes Must match those of existing PV or dynamic provisioner </br> Ref: http://kubernetes.io/docs/user-guide/persistent-volumes/ |
| persistentVolume.annotations | object | `{}` | Persistent Volume annotations |
| persistentVolume.enabled | bool | `true` | Enable or disable persistence |
| persistentVolume.labels | object | `{}` | Persistent Volume labels |
| persistentVolume.selector | object | `{}` | Persistent Volume Claim Selector Useful if Persistent Volumes have been provisioned in advance </br> Ref: https://kubernetes.io/docs/concepts/storage/persistent-volumes/#selector |
| persistentVolume.size | string | `"1Gi"` | Persistent Volume size |
| persistentVolume.storageClass | string | `""` | Persistent Volume Storage Class If defined, storageClassName: <storageClass> If set to "-", storageClassName: "", which disables dynamic provisioning If undefined (the default) or set to null, no storageClassName spec is   set, choosing the default provisioner.  (gp2 on AWS, standard on   GKE, AWS & OpenStack) |
| persistentVolume.volumeBindingMode | string | `""` | Persistent Volume Binding Mode If defined, volumeBindingMode: <volumeBindingMode> If undefined (the default) or set to null, no volumeBindingMode spec is set, choosing the default mode. |
| podAnnotations | object | `{}` | Configure annotations on Pods |
| podDisruptionBudget | object | `{"enabled":false,"maxUnavailable":1,"minAvailable":null}` | Pod Disruption Budget </br> Ref: https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/pod-disruption-budget-v1/ |
| podLabels | object | `{}` | Configure labels on Pods |
| podManagementPolicy | string | `"OrderedReady"` | Ordering options for updates Valid values: "OrderedReady" or "Parallel" |
| podSecurityContext | object | `{"fsGroup":1000}` | Defines privilege and access control settings for a Pod </br> Ref: https://kubernetes.io/docs/concepts/security/pod-security-standards/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ |
| replicaCount | int | `1` | Number of replicas Specifies the number of replicas for the service |
| repoCloner | object | `{"args":["-c","/entrypoint.sh"],"command":["/bin/sh"],"env":{},"envFromConfigMap":{},"envFromFiles":[],"envFromSecrets":{},"homePath":"/home/kdl","image":{"pullPolicy":"IfNotPresent","repository":"konstellation/kdl-repo-cloner","tag":"latest"},"lifecycle":{},"volumeMounts":[]}` | Module cloning external repositories of the projects in which the user participates. This way they are available for code-server to be able to work with it. </br> Ref: https://github.com/konstellation-io/kdl-server/tree/main/repo-cloner |
| repoCloner.args | list | `["-c","/entrypoint.sh"]` | Configure args </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| repoCloner.command | list | `["/bin/sh"]` | Configure command </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| repoCloner.env | object | `{}` | Environment variables to configure application |
| repoCloner.envFromConfigMap | object | `{}` | Variables from configMap |
| repoCloner.envFromFiles | list | `[]` | Load all variables from files </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#configure-all-key-value-pairs-in-a-configmap-as-container-environment-variables |
| repoCloner.envFromSecrets | object | `{}` | Variables from secrets |
| repoCloner.homePath | string | `"/home/kdl"` | Mountpath where mount data |
| repoCloner.lifecycle | object | `{}` | Configure lifecycle hooks </br> Ref: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/ </br> Ref: https://learnk8s.io/graceful-shutdown |
| repoCloner.volumeMounts | list | `[]` | Additional volumeMounts on the output Deployment definition |
| resources | object | `{}` | Resources limits and requested </br> Ref: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| securityContext | object | `{}` | Defines privilege and access control settings for a Container </br> Ref: https://kubernetes.io/docs/concepts/security/pod-security-standards/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ |
| serviceAccount | object | `{"annotations":{},"automount":true,"create":true,"name":""}` | Enable creation of ServiceAccount </br> Ref: https://kubernetes.io/docs/concepts/security/service-accounts/ |
| sharedVolume | object | `{"enabled":false,"name":""}` | String to set external volume to use on user-tools workspace |
| sharedVolume.enabled | bool | `false` | Enable or disable sharedVolume use |
| terminationGracePeriodSeconds | int | `30` | Configure Pod termination grace period </br> Ref: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination |
| tolerations | list | `[]` | Tolerations for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| topologySpreadConstraints | list | `[]` | Control how Pods are spread across your cluster </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/#example-multiple-topologyspreadconstraints |
| updateStrategy | object | `{"rollingUpdate":{"maxSurge":1,"maxUnavailable":1,"partition":0},"type":"RollingUpdate"}` | This feature can be used to upgrade the container images, resource requests and/or limits, labels, and annotations of the Pods </br> Ref: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/ |
| updateStrategy.type | string | `"RollingUpdate"` | StatefulSet update strategy policy Valid values: "RollingUpdate" or "OnDelete" |
| username | string | `"replaced-by-kdl-api"` | String from KDL API |
| usernameSlug | string | `"replaced-by-kdl-api"` | String from KDL API used slug replacer </br> Ref: https://pkg.go.dev/github.com/gosimple/slug |
| volumes | list | `[]` | Additional volumes on the output Deployment definition </br> Ref: https://kubernetes.io/docs/concepts/storage/volumes/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/ </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#create-a-pod-that-has-access-to-the-secret-data-through-a-volume |
| vscodeRuntime | object | `{"args":["-c","trap : TERM INT; sleep infinity & wait"],"command":["/bin/bash"],"env":{},"envFromConfigMap":{},"envFromFiles":[],"envFromSecrets":{},"homePath":"/home/coder","image":{"pullPolicy":"IfNotPresent","repository":"replaced-by-kdl-api","tag":"replaced-by-kdl-api"},"lifecycle":{},"volumeMounts":[]}` | Runtime refers to a pre-configured containerized environment, equipped with the tools, libraries, and dependencies which data scientists need to develop, test and deploy models. </br> Ref: https://github.com/konstellation-io/konstellation-runtimes |
| vscodeRuntime.args | list | `["-c","trap : TERM INT; sleep infinity & wait"]` | Configure args </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| vscodeRuntime.command | list | `["/bin/bash"]` | Configure command </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| vscodeRuntime.env | object | `{}` | Environment variables to configure application |
| vscodeRuntime.envFromConfigMap | object | `{}` | Variables from configMap |
| vscodeRuntime.envFromFiles | list | `[]` | Load all variables from files </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#configure-all-key-value-pairs-in-a-configmap-as-container-environment-variables |
| vscodeRuntime.envFromSecrets | object | `{}` | Variables from secrets |
| vscodeRuntime.homePath | string | `"/home/coder"` | Mountpath where mount data |
| vscodeRuntime.lifecycle | object | `{}` | Configure lifecycle hooks </br> Ref: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/ </br> Ref: https://learnk8s.io/graceful-shutdown |
| vscodeRuntime.volumeMounts | list | `[]` | Additional volumeMounts on the output Deployment definition |
