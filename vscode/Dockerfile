# Debian 10
FROM codercom/code-server:3.10.2

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

WORKDIR /tmp

ARG GO_VERSION=1.15.2
ARG GOLANGCI_VERSION=1.24.0
ARG DEBIAN_FRONTEND=noninteractive

ENV GOROOT=/usr/local/go \
    GO111MODULE=on \
    GOPATH=/go \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    ORACLE_HOME=/opt/oracle/instantclient_18_5
    
ENV PATH="$GOPATH/bin:$GOROOT/bin:$PATH" \
    LD_RUN_PATH=$ORACLE_HOME

COPY deps/go_packages.txt deps/requirements.txt \
     instantclient-basic-linux.x64-18.5.0.0.0dbru.zip \
     instantclient-sdk-linux.x64-18.5.0.0.0dbru.zip /tmp/
COPY default_user_settings.json /config/default_user_settings.json
COPY entrypoint.sh /entrypoint.sh

USER root

# Install Golang
# hadolint ignore=SC2046
RUN curl -O https://dl.google.com/go/go$GO_VERSION.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go$GO_VERSION.linux-amd64.tar.gz && \
    rm go$GO_VERSION.linux-amd64.tar.gz && \
    mkdir $GOPATH && \
    go get -v $(cat /tmp/go_packages.txt) && \ 
    chown coder:coder -R $GOPATH && \
# Install Minio client
    curl -L -o /usr/local/bin/mc https://dl.min.io/client/mc/release/linux-amd64/mc && \
      chmod +x /usr/local/bin/mc && \
# Add Coudera Impala ODBC apt repository
    curl -L -o /tmp/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb https://downloads.cloudera.com/connectors/ClouderaImpala_ODBC_2.6.4.1004/Debian/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb && \ 
      dpkg -i /tmp/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb && \
# Setup apt packages
    apt-get update && \
    apt-get install -yq --no-install-recommends \
      fonts-liberation \
      gcc \
      g++ \
      jq \
      libaio1 \
      libffi-dev  \
      libgtk2.0-dev \
      libllvm-7-ocaml-dev \
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
    # Cleanup apt cache
    apt-get clean && apt-get autoremove -y && \
      rm -rf /var/lib/apt/ && \
    # Alternatives
    update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 2 && \
    update-alternatives --set pip /usr/bin/pip3 && \
# Download UnixODBC
    curl -L -o /tmp/unixODBC-2.3.7.tar.gz -L http://www.unixodbc.org/unixODBC-2.3.7.tar.gz && \
      tar xvf /tmp/unixODBC-2.3.7.tar.gz --directory=/tmp/ && \
      cd /tmp/unixODBC-2.3.7 && \
      ./configure && \
      make && \
      make install && \
      ldconfig && \
      cd - && \
# Install Oracle client
    unzip "/tmp/instantclient*.zip" -d /opt/oracle && \
      echo "$ORACLE_HOME" > /etc/ld.so.conf.d/oracle-instantclient.conf && \
      ldconfig && \
      export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH && \
# Install python libraries
    pip install --no-cache-dir setuptools wheel && \
    pip install --no-cache-dir cython thriftpy && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt && \
# Install VSCode extensions
    mkdir /extensions && \
    code-server \
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
      --extensions-dir /extensions \
      /home/coder && \
# Fix permissions and Cleanup temporary files
    chown -R coder:coder /home/coder /extensions /entrypoint.sh && rm -rf /tmp/*

WORKDIR /home/coder

USER coder

ENTRYPOINT ["/entrypoint.sh"]
