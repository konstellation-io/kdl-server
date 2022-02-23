FROM codercom/code-server:4.0.1

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

ENV PIPENV_VENV_IN_PROJECT = 1 \
    KUBECONFIG="/home/coder/.kube/config"

WORKDIR /tmp

USER root

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update && \
# ==================================================================
# python
# ------------------------------------------------------------------
    DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
        # software-properties-common \
        apt-utils \
        # ca-certificates \
        # gpg \
        # dirmngr \
        jq \
        python3.9 \
        python3.9-dev \
        python3.9-distutils \
        python3-distutils-extra \
        wget \
        && \
    wget -O ~/get-pip.py \
        https://bootstrap.pypa.io/get-pip.py && \
    python3.9 ~/get-pip.py && \
    ln -s /usr/bin/python3.9 /usr/local/bin/python && \

# ==================================================================
# config & cleanup
# ------------------------------------------------------------------
    apt-get clean && apt-get autoremove -y && \
        rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
        rm -rf -- *

# ==================================================================
# Kubectl
# ------------------------------------------------------------------
RUN curl -o /usr/local/bin/kubectl -L "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x /usr/local/bin/kubectl

# Install python libraries
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir setuptools wheel && \
    pip install --no-cache-dir -r /tmp/requirements.txt

USER coder

WORKDIR /home/coder

# Install VSCode extensions
COPY --chown=coder:coder default_user_settings.json /vscode/config/default_user_settings.json
COPY --chown=coder:coder entrypoint.sh /entrypoint.sh
RUN code-server \
      --install-extension christian-kohler.path-intellisense \
      --install-extension eamodio.gitlens \
      --install-extension gruntfuggly.todo-tree \
      --install-extension mechatroner.rainbow-csv \
      --install-extension ms-pyright.pyright \
      --install-extension mhutchie.git-graph \
      --install-extension ms-kubernetes-tools.vscode-kubernetes-tools \
      --install-extension ms-python.python \
      --install-extension njpwerner.autodocstring \
      --install-extension redhat.vscode-yaml \
      --install-extension vscode-icons-team.vscode-icons \
      --install-extension wayou.vscode-todo-highlight \
      --install-extension yzhang.markdown-all-in-one \
      --install-extension zxh404.vscode-proto3 \
      --extensions-dir /vscode/extensions
ENTRYPOINT ["/entrypoint.sh"]
