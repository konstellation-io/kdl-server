# Build API.
FROM golang:1.14.12-alpine3.12 as api-builder

ENV CGO_ENABLED=0

WORKDIR /app
COPY api/go.* ./
RUN go mod download
COPY api .
RUN go build -o kdl-server http/main.go

# Build UI
FROM node:14 as ui-builder

ENV SASS_PATH=src
WORKDIR /app
COPY ui/package.* ./
COPY ui/yarn* ./
RUN yarn install
COPY ui/ .
RUN yarn build

# Create APP image
FROM alpine:3.10.2

ENV USER=kdl
ENV UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN apk add -U --no-cache ca-certificates
RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=api-builder /app/kdl-server .
COPY --from=api-builder /app/config.yml .
COPY --from=ui-builder /app/build /public
RUN apk add libcap && setcap 'cap_net_bind_service=+ep' /app/kdl-server
RUN chown -R kdl:0 /app \
    && chmod -R g+w /app \
    && chown -R kdl:0 /var/log/app \
    && chmod -R g+w /var/log/app \
    && chown -R kdl:0 /public \
    && chmod -R g+w /public 

USER kdl

CMD ["sh","-c","/app/kdl-server 2>&1 | tee -a /var/log/app/app.log"]
