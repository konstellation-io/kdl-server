FROM golang:1.14-alpine3.11 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

# Pass Hadolint
LABEL maintainer="Builder"

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o cleaner .


FROM alpine:3.11

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

COPY --from=builder /app/cleaner /usr/local/bin/
