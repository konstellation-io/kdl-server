{{- if .Values.domain }}
{{- fail "`domain` has been deprecated! It has been renamed to `global.domain`." -}}
{{- end }}

{{- if .Values.tls }}
{{- fail "`tls` has been deprecated! It has been renamed to `global.tls`." -}}
{{- end }}

{{- if .Values.serverName }}
{{- fail "`serverName` has been deprecated! It has been renamed to `global.serverName`." -}}
{{- end }}
