FROM golang:1.14.12-alpine3.12 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o admin-api .


FROM alpine:3.10.2

# Create kdl user.
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
COPY --from=builder /app/admin-api .
RUN apk add libcap && setcap 'cap_net_bind_service=+ep' /app/admin-api
RUN chown -R kdl:0 /app \
    && chmod -R g+w /app \
    && chown -R kdl:0 /var/log/app \
    && chmod -R g+w /var/log/app

USER kdl

CMD ["sh","-c","/app/admin-api 2>&1 | tee -a /var/log/app/app.log"]
