{{/*
Add the protocol part to the uri
*/}}
{{- define "http.protocol" -}}
  {{ ternary "https" "http" .Values.global.ingress.tls.enabled }}
{{- end -}}

{{/* Create the name of knowledge-galaxy service account to use */}}
{{- define "knowledgeGalaxy.serviceAccountName" -}}
{{- if .Values.knowledgeGalaxy.serviceaccount.enabled -}}
    {{ default "knowledge-galaxy" .Values.knowledgeGalaxy.serviceaccount.name }}
{{- end -}}
{{- end -}}

{{/*
Global tls secret name
*/}}
{{- define "global.tlsSecretName" -}}
{{-  if kindIs "invalid" .Values.global.ingress.tls.secretName -}}
  {{- printf "%s-%s-tls" $.Values.global.domain $.appName -}}
{{- else -}}
  {{- .Values.global.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create minio tls secret name
*/}}
{{- define "minio.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.minio.ingress.tls.secretName -}}
  {{- $_ := set $ "appName" "minio" }}
  {{- include "global.tlsSecretName" . -}}
{{- else -}}
  {{- .Values.minio.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create minio tls secret name
*/}}
{{- define "minioConsole.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.minio.consoleIngress.tls.secretName -}}
  {{- $_ := set $ "appName" "minio-console" }}
  {{- include "global.tlsSecretName" . -}}
{{- else -}}
  {{- .Values.minio.consoleIngress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create kdlServer tls secret name
*/}}
{{- define "kdlServer.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.kdlServer.ingress.tls.secretName -}}
  {{- $_ := set $ "appName" "kdlapp" }}
  {{- include "global.tlsSecretName" . -}}
{{- else -}}
  {{- .Values.kdlServer.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create drone tls secret name
*/}}
{{- define "drone.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.drone.ingress.tls.secretName -}}
  {{- $_ := set $ "appName" "drone" }}
  {{- include "global.tlsSecretName" . -}}
{{- else -}}
  {{- .Values.drone.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create gitea tls secret name
*/}}
{{- define "gitea.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.gitea.ingress.tls.secretName -}}
  {{- $_ := set $ "appName" "gitea" }}
  {{- include "global.tlsSecretName" . -}}
{{- else -}}
  {{- .Values.gitea.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create user-tools tls secret name
*/}}
{{- define "userTools.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.userToolsOperator.ingress.tls.secretName -}}
  {{- .Values.global.ingress.tls.secretName -}}
{{- else -}}
  {{- .Values.userToolsOperator.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}

{{/*
Create projectOperator mlflow tls secret name
*/}}
{{- define "projectOperator.mlflow.tlsSecretName" -}}
{{- if kindIs "invalid" .Values.projectOperator.mlflow.ingress.tls.secretName -}}
  {{- .Values.global.ingress.tls.secretName -}}
{{- else -}}
  {{- .Values.projectOperator.mlflow.ingress.tls.secretName -}}
{{- end -}}
{{- end -}}
