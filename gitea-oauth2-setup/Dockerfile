FROM golang:1.23.1-alpine3.20 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

LABEL maintainer="Builder"

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o gitea-oauth2-setup .


# Create APP image
FROM alpine:3.13.6

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

WORKDIR /app
COPY --from=builder /app/gitea-oauth2-setup .

CMD ["/app/gitea-oauth2-setup"]
