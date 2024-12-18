{{/*
Expand the name of the chart
*/}}
{{- define "kdl-project.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kdl-project.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- if .Values.nameOverride }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label
*/}}
{{- define "kdl-project.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "kdl-project.labels" -}}
helm.sh/chart: {{ include "kdl-project.chart" . }}
{{ include "kdl-project.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "kdl-project.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kdl-project.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
#######################
# FILEBROWSER SECTION
#######################
*/}}

{{/*
Expand the name of the chart
*/}}
{{- define "kdl-project.filebrowser.name" -}}
{{- printf "%s-filebrowser" .Values.projectId | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "kdl-project.filebrowserServiceAccountName" -}}
{{- if .Values.filebrowser.serviceAccount.create -}}
{{- default (include "kdl-project.filebrowser.name" .) .Values.filebrowser.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.filebrowser.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Default filebowser component
*/}}
{{- define "kdl-project.filebrowserComponentLabel" -}}
kdl-project/component: filebrowser
kdl-project/projectId: {{ .Values.projectId | quote }}
{{- end -}}

{{/*
Generate labels for filebowser component
*/}}
{{- define "kdl-project.filebrowserLabels" -}}
{{- toYaml (merge ((include "kdl-project.labels" .) | fromYaml) ((include "kdl-project.filebrowserComponentLabel" .) | fromYaml)) }}
{{- end }}

{{/*
Generate selectorLabels for filebowser component
*/}}
{{- define "kdl-project.selectorFilebrowserLabels" -}}
{{- toYaml (merge ((include "kdl-project.selectorLabels" .) | fromYaml) ((include "kdl-project.filebrowserComponentLabel" .) | fromYaml)) }}
{{- end }}

{{/*
Ref: https://github.com/aws/karpenter-provider-aws/blob/main/charts/karpenter/templates/_helpers.tpl
Patch the label selector on an object
This template will add a labelSelector using matchLabels to the object referenced at _target if there is no labelSelector specified.
The matchLabels are created with the selectorLabels template.
This works because Helm treats dictionaries as mutable objects and allows passing them by reference.
*/}}
{{- define "kdl-project.patchSelectorFilebrowserLabels" -}}
{{- if not (hasKey ._target "labelSelector") }}
{{- $selectorLabels := (include "kdl-project.selectorFilebrowserLabels" .) | fromYaml }}
{{- $_ := set ._target "labelSelector" (dict "matchLabels" $selectorLabels) }}
{{- end }}
{{- end }}

{{/*
Ref: https://github.com/aws/karpenter-provider-aws/blob/main/charts/karpenter/templates/_helpers.tpl
Patch topology spread constraints
This template uses the kdl-project.selectorLabels template to add a labelSelector to topologySpreadConstraints if one isn't specified.
This works because Helm treats dictionaries as mutable objects and allows passing them by reference.
*/}}
{{- define "kdl-project.patchTopologySpreadConstraintsFilebrowser" -}}
{{- range $constraint := .Values.filebrowser.topologySpreadConstraints }}
{{- include "kdl-project.patchSelectorFilebrowserLabels" (merge (dict "_target" $constraint (include "kdl-project.selectorFilebrowserLabels" $)) $) }}
{{- end }}
{{- end }}

{{/*
#######################
# MLFLOW SECTION
#######################
*/}}

{{/*
Expand the name of the chart
*/}}
{{- define "kdl-project.mlflow.name" -}}
{{- printf "%s-mlflow" .Values.projectId | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "kdl-project.mlflowServiceAccountName" -}}
{{- if .Values.mlflow.serviceAccount.create -}}
{{- default (include "kdl-project.mlflow.name" .) .Values.mlflow.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.mlflow.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Default MLflow component
*/}}
{{- define "kdl-project.mlflowComponentLabel" -}}
kdl-project/component: mlflow
kdl-project/projectId: {{ .Values.projectId | quote }}
{{- end -}}

{{/*
Generate labels for MLflow component
*/}}
{{- define "kdl-project.mlflowLabels" -}}
{{- toYaml (merge ((include "kdl-project.labels" .) | fromYaml) ((include "kdl-project.mlflowComponentLabel" .) | fromYaml)) }}
{{- end }}

{{/*
Generate selectorLabels for MLflow component
*/}}
{{- define "kdl-project.selectorMlflowLabels" -}}
{{- toYaml (merge ((include "kdl-project.selectorLabels" .) | fromYaml) ((include "kdl-project.mlflowComponentLabel" .) | fromYaml)) }}
{{- end }}

{{/*
Ref: https://github.com/aws/karpenter-provider-aws/blob/main/charts/karpenter/templates/_helpers.tpl
Patch the label selector on an object
This template will add a labelSelector using matchLabels to the object referenced at _target if there is no labelSelector specified.
The matchLabels are created with the selectorLabels template.
This works because Helm treats dictionaries as mutable objects and allows passing them by reference.
*/}}
{{- define "kdl-project.patchSelectorMlflowLabels" -}}
{{- if not (hasKey ._target "labelSelector") }}
{{- $selectorLabels := (include "kdl-project.selectorMlflowLabels" .) | fromYaml }}
{{- $_ := set ._target "labelSelector" (dict "matchLabels" $selectorLabels) }}
{{- end }}
{{- end }}

{{/*
Ref: https://github.com/aws/karpenter-provider-aws/blob/main/charts/karpenter/templates/_helpers.tpl
Patch topology spread constraints
This template uses the kdl-project.selectorLabels template to add a labelSelector to topologySpreadConstraints if one isn't specified.
This works because Helm treats dictionaries as mutable objects and allows passing them by reference.
*/}}
{{- define "kdl-project.patchTopologySpreadConstraintsMlflow" -}}
{{- range $constraint := .Values.mlflow.topologySpreadConstraints }}
{{- include "kdl-project.patchSelectorMlflowLabels" (merge (dict "_target" $constraint (include "kdl-project.selectorMlflowLabels" $)) $) }}
{{- end }}
{{- end }}

{{/*
Create default host name for MLflow
*/}}
{{- define "kdl-project.mlflow.defaultHost" -}}
{{- printf "%s-mlflow.%s" .Values.projectId .Values.domain -}}
{{- end -}}

{{/*
Generate TLS secret name for MLflow
*/}}
{{- define "kdl-project.mlflow.tlsSecretName" -}}
{{- printf "%s-mlflow-tls" .Release.Name -}}
{{- end -}}

{{/*
Generate combined hosts list for MLflow ingress
Always includes the default host and appends any additional hosts if configured
*/}}
{{- define "kdl-project.mlflow.hosts" -}}
{{- $defaultHost := include "kdl-project.mlflow.defaultHost" . -}}
{{- $fullName := include "kdl-project.mlflow.name" . -}}
{{- $svcPort := .Values.mlflow.service.port -}}
- host: {{ $defaultHost }}
  http:
    paths:
      - path: /
        pathType: ImplementationSpecific
        backend:
          service:
            name: {{ $fullName }}
            port:
              number: {{ $svcPort }}
{{- if .Values.mlflow.ingress.hosts }}
{{- range .Values.mlflow.ingress.hosts }}
- host: {{ .host }}
  http:
    paths:
    {{- range .paths }}
      - path: {{ .path }}
        pathType: {{ .pathType }}
        backend:
          service:
            name: {{ $fullName }}
            port:
              number: {{ $svcPort }}
    {{- end }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Generate TLS configuration
*/}}
{{- define "kdl-project.mlflow.tls" -}}
{{- if .Values.mlflow.ingress.tls.enabled -}}
{{- $defaultHost := include "kdl-project.mlflow.defaultHost" . -}}
{{- $defaultSecret := include "kdl-project.mlflow.tlsSecretName" . -}}
- hosts:
  - {{ $defaultHost }}
  secretName: {{ $defaultSecret }}
{{- end -}}
{{- if .Values.mlflow.ingress.tls.extraTLS -}}
{{- range .Values.mlflow.ingress.tls.extraTLS }}
- hosts:
  {{- range .hosts }}
  - {{ . | quote }}
  {{- end }}
  secretName: {{ .secretName }}
{{- end -}}
{{- end -}}
{{- end -}}
