{{/*
Add the protocol part to the uri
*/}}
{{- define "protocol" -}}
  {{ ternary "https" "http" .Values.tls.enabled }}
{{- end -}}

{{/*
Expand the name of the chart.
*/}}
{{- define "kdlproject.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kdlproject.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "kdlproject.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "kdlproject.labels" -}}
helm.sh/chart: {{ include "kdlproject.chart" . }}
{{ include "kdlproject.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "kdlproject.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kdlproject.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "kdlproject.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "kdlproject.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create project mlflow tls secret name
*/}}
{{- define "kdlproject.mlflow.tlsSecretName" -}}
{{- if hasKey .Values.mlflow.ingress.tls "secretName" -}}
  {{- .Values.mlflow.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "%s-mlflow-tls" .Values.projectId -}}
{{- end -}}
{{- end -}}
