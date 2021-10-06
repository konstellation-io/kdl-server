# BEGIN BASE
FROM codercom/code-server:3.10.2 AS base

LABEL maintainer="Base"

WORKDIR /tmp

ARG GO_VERSION=1.15.2
ARG GOLANGCI_VERSION=1.24.0

ENV GOROOT=/usr/local/go \
    GO111MODULE=on \
    GOPATH=/go \
    GO_VERSION="$GO_VERSION" \
    GOLANGCI_VERSION="$GOLANGCI_VERSION" \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    ORACLE_HOME=/opt/oracle/instantclient_18_5
    
ENV PATH="$GOPATH/bin:$GOROOT/bin:$PATH" \
    LD_RUN_PATH="$ORACLE_HOME"

# hadolint ignore=DL3002
USER root

# END BASE

FROM base AS odbc-builder

# hadolint ignore=DL3003
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
      automake \
      gcc \
      g++ \
      libltdl-dev \
      libtool \
      make && \
    # Download and build UnixODBC
    curl -L -o /tmp/unixODBC.tar.gz -L https://github.com/lurcher/unixODBC/archive/refs/tags/v2.3.9.tar.gz && \
      mkdir -p /tmp/unixODBC && \
      tar xvf /tmp/unixODBC.tar.gz -C /tmp/unixODBC --strip-components 1 && \
      cd /tmp/unixODBC && \
      autoreconf -fiv && \
      ./configure --prefix=/opt/odbc/ && \
      make && \
      make install

FROM base AS golang-builder

LABEL key="Builder"

COPY deps/go_packages.txt /tmp/go_packages.txt

RUN curl -O "https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz" && \
    tar -C /usr/local -xzf "go${GO_VERSION}.linux-amd64.tar.gz" && \
    mkdir "${GOPATH}" && \
    xargs go get -v < /tmp/go_packages.txt
    
FROM base

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

COPY instantclient-basic-linux.x64-18.5.0.0.0dbru.zip \
      instantclient-sdk-linux.x64-18.5.0.0.0dbru.zip /tmp/
COPY --chown=coder:coder default_user_settings.json /config/default_user_settings.json

COPY --from=odbc-builder /opt/odbc/ /usr/local/
COPY --from=golang-builder --chown=coder:coder $GOPATH/ $GOPATH/
COPY --from=golang-builder --chown=coder:coder $GOROOT/ $GOROOT/

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install Minio client
RUN curl -L -o /usr/local/bin/mc https://dl.min.io/client/mc/release/linux-amd64/mc && \
      chmod +x /usr/local/bin/mc && \
# Add Cloudera Impala ODBC apt repository
    curl -L -o /tmp/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb https://downloads.cloudera.com/connectors/ClouderaImpala_ODBC_2.6.4.1004/Debian/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb && \ 
      dpkg -i /tmp/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb && \
# Setup apt packages
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
      fonts-liberation \
      gcc \
      g++ \
      jq \
      libaio1 \
      libffi-dev  \
      libgtk2.0-dev \
      libllvm-7-ocaml-dev \
      libltdl7 \
      libssl-dev \
      libxml2-dev \
      libxslt1-dev \
      llvm-7 \
      llvm-7-dev \
      llvm-7-runtime \
      llvm-7-tools \
      make \
      protobuf-compiler \
      python3.7-dev \
      python3-pip \
      unzip \
      zip \
      zlib1g-dev && \
    # Alternatives
    update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 2 && \
    update-alternatives --set pip /usr/bin/pip3 && \
# Install Oracle client
    unzip "/tmp/instantclient*.zip" -d /opt/oracle && \
      echo "$ORACLE_HOME" > /etc/ld.so.conf.d/oracle-instantclient.conf && \
      ldconfig && \
      export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH && \
# Cleanup apt cache and /tmp
    apt-get clean && apt-get autoremove -y && \
      rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
      rm -rf -- * 

# Install python libraries
COPY deps/requirements.txt /tmp/
RUN pip install --no-cache-dir setuptools wheel && \
    pip install --no-cache-dir cython thriftpy && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt

USER coder

WORKDIR /home/coder

# Install VSCode extensions
COPY --chown=coder:coder entrypoint.sh /entrypoint.sh
RUN code-server \
      --install-extension christian-kohler.path-intellisense \
      --install-extension eamodio.gitlens \
      --install-extension gruntfuggly.todo-tree \
      --install-extension jithurjacob.nbpreviewer \
      --install-extension mechatroner.rainbow-csv \
      --install-extension mhutchie.git-graph \
      --install-extension ms-python.python \
      --install-extension golang.go \
      --install-extension njpwerner.autodocstring \
      --install-extension redhat.vscode-yaml \
      --install-extension tushortz.python-extended-snippets \
      --install-extension vscode-icons-team.vscode-icons \
      --install-extension wayou.vscode-todo-highlight \
      --install-extension yzhang.markdown-all-in-one \
      --install-extension zxh404.vscode-proto3 \
      --extensions-dir ~/.vscode/extensions

ENTRYPOINT ["/entrypoint.sh"]
