{{/*
Add the protocol part to the uri
*/}}
{{- define "protocol" -}}
  {{ ternary "https" "http" .Values.tls.enabled }}
{{- end -}}

{{/*
Create MongoDB URI.
*/}}
{{- define "kdl.mongoURI" -}}
  {{- printf "mongodb://%s:%s@kdl-mongo-0:27017/admin?replicaSet=rs0" $.Values.mongodb.auth.adminUser $.Values.mongodb.auth.adminPassword -}}
{{- end -}}