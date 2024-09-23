FROM golang:1.23.1-alpine3.20 as builder

LABEL maintainer="Builder"

# Build the binary statically.
ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o repo-cloner .


FROM alpine:3.10.2

LABEL maintainer="Intelygenz - Konstellation Team"

ENV USER=kdl
ENV UID=1000

WORKDIR /app

# Create kre user.
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/home/kdl" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    "${USER}" && \
    # Install openssh client
    apk add --no-cache git openssh-client

# Copy build from previous stage
COPY --from=builder --chown=${USER}:0 /app/repo-cloner /app/config.yml ./

USER ${USER}

CMD ["/app/repo-cloner"]
