{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "user-tools.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "user-tools.fullname" -}}
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
Create chart name and version as used by the chart label.
*/}}
{{- define "user-tools.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "user-tools.labels" -}}
helm.sh/chart: {{ include "user-tools.chart" . }}
{{ include "user-tools.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app: user-tools-{{ .Values.usernameSlug }}
runtimeId: {{ .Values.vscodeRuntime.runtimeId }}
capabilityId: {{ .Values.vscodeRuntime.capabilityId }}
kdl-server.component: user-tools
{{- end }}

{{/*
Selector labels
*/}}
{{- define "user-tools.selectorLabels" -}}
app.kubernetes.io/name: {{ include "user-tools.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "user-tools.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "user-tools.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
##############
# WIP LEGACY #
##############
*/}}

{{/*
Add the protocol part to the uri
*/}}
{{- define "protocol" -}}
{{ ternary "https" "http" .Values.tls.enabled }}
{{- end -}}

{{/*
Create user-tools tls secret name
*/}}
{{- define "user-tools.tlsSecretName" -}}
{{- if hasKey .Values.tls "secretName" -}}
  {{- .Values.tls.secretName -}}
{{- else -}}
  {{- printf "%s-tls" (include "user-tools.fullname" .) -}}
{{- end -}}
{{- end -}}
