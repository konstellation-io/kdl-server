FROM nvidia/cuda:11.0.3-cudnn8-runtime-ubuntu18.04 as odbc-builder

LABEL maintainer="ODBC Builder"

WORKDIR /tmp

# hadolint ignore=DL3003
RUN apt-get update && \
        DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
            curl \
            automake \
            g++ \
            gcc \
            libltdl-dev \
            libtool \
            make && \
    # Build unixodbc 2.3.7
    curl -sL https://github.com/lurcher/unixODBC/archive/refs/tags/v2.3.9.tar.gz -o /tmp/unixODBC.tar.gz && \
        mkdir -p /tmp/unixODBC /opt/odbc && \
        tar xvf /tmp/unixODBC.tar.gz -C /tmp/unixODBC --strip-components 1 && \
        cd /tmp/unixODBC && \
        autoreconf -fiv && \
        ./configure --prefix=/opt/odbc && \
        make && \
        make install && \
    # It is needed to tar the files to preserve symlinks
    tar cf /opt/odbc.tar -C /opt odbc/

FROM nvidia/cuda:11.0.3-cudnn8-runtime-ubuntu18.04

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

ARG GO_VERSION=1.14.2
ARG NODE_VERSION=14.4.0
ARG NODEJS_HOME=/opt/node
ARG TINI_VERSION=v0.18.0
ARG YARN_VERSION=1.19.1
ARG YARN_HOME=/opt/yarn

WORKDIR /tmp

# Configure environment
ENV NB_GID="100" \
        NB_UID="1000" \
        NB_USER="jovyan" \
        LC_ALL=en_US.utf-8 \
        LANG=en_US.UTF-8 \
        LANGUAGE=en_US.UTF-8 \
        # Set GO environment variables.
        GOROOT=/usr/local/go \
        # Oracle environment variables
        ORACLE_HOME=/opt/oracle/instantclient_18_5

# Set PATH
ENV GOPATH=/home/${NB_USER}/go
ENV PATH=${NODEJS_HOME}/bin:${YARN_HOME}/bin:${GOROOT}/bin:${GOPATH}/bin:${PATH}
ENV LD_LIBRARY_PATH=${ORACLE_HOME}:${LD_LIBRARY_PATHENV} LD_RUN_PATH=${ORACLE_HOME}

COPY instantclient-* /tmp/
COPY fix-permissions /usr/local/bin/fix-permissions
COPY --from=odbc-builder /opt/odbc /usr/local/

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install all OS dependencies for notebook server that starts but lacks all
# features (e.g., download as all possible file formats)
RUN apt-get update && \
        DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
        curl \
        fonts-liberation \
        g++ \
        gcc \
        git \
        language-pack-es \
        less \
        libaio1 \
        libffi-dev  \
        libgl1-mesa-glx \
        libgtk2.0-dev \
        libltdl7 \
        libllvm-10-ocaml-dev \
        llvm-10 \
        llvm-10-dev \
        llvm-10-runtime \
        llvm-10-tools \
        locales \
        openssh-client \
        python3.7 \
        python3.7-dev \
        python3-pip \
        sudo \
        unzip \
        xz-utils \
        zip && \
    # Configure locale
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
        locale-gen en_US.UTF-8 && \
    # Set Python 3.7 as default
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 1 && \
        update-alternatives --set python3 /usr/bin/python3.7 && \
        update-alternatives --install /usr/bin/python python /usr/bin/python3.7 2 && \
        update-alternatives --set python /usr/bin/python3.7 && \
        update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 3 && \
        update-alternatives --set pip /usr/bin/pip3 && \
    # Install Minio client
    curl -s https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc && \
        chmod +x /usr/local/bin/mc && \
    # Install Cloudera Impala driver
    curl -s https://downloads.cloudera.com/connectors/ClouderaImpala_ODBC_2.6.4.1004/Debian/clouderaimpalaodbc_2.6.4.1004-2_amd64.deb -o clouderaimpalaodbc.deb && \
        dpkg -i clouderaimpalaodbc.deb && \
    # Install Oracle client
    mkdir -p /opt/oracle && \
        unzip "/tmp/instantclient*.zip" -d /opt/oracle && \
        echo ${ORACLE_HOME} > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    # Link Oracle Client and unixODBC libraries
    ldconfig && \
    # Add Tini
    curl -s -L -o /usr/local/bin/tini https://github.com/krallin/tini/releases/download/v0.18.0/tini && \
        chmod +x /usr/local/bin/tini && \
    # Install Node, Npm, Yarn & Go
    curl -s -O https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz && \
        mkdir ${NODEJS_HOME} && tar -xf node-v${NODE_VERSION}-linux-x64.tar.xz --strip-components 1 -C ${NODEJS_HOME} && \
    curl -sL -O https://yarnpkg.com/downloads/${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz && \
        mkdir ${YARN_HOME} && tar zxf yarn-v${YARN_VERSION}.tar.gz --strip-components 1 -C ${YARN_HOME} && \
    curl -s -O https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz && \
        mkdir -p ${GOROOT} && tar xzf go${GO_VERSION}.linux-amd64.tar.gz --strip-components 1 -C ${GOROOT} && \
    # Create jovyan user with UID=1000 and in the 'users' group
    # and make sure these dirs are writable by the `users` group.
    groupadd wheel -g 11 && \
        useradd -l -m -s /bin/bash -N -u ${NB_UID} ${NB_USER} && \
    echo "auth required pam_wheel.so use_uid" >> /etc/pam.d/su && \
    fix-permissions /usr/bin /usr/sbin /var/ && \
    # Apt and /tmp cleanup
    apt-get clean && apt-get autoremove -y && \
        rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
        rm -rf -- *

# Install Python modules
COPY ./requirements.txt requirements.txt

RUN pip install --no-cache-dir setuptools wheel && \
    pip install --no-cache-dir cython thriftpy && \
    pip install --no-cache-dir pip --upgrade && \
    pip install --no-cache-dir -r requirements.txt --ignore-installed PyYAML && \
    ln -s /usr/bin/llvm-config-10 /usr/bin/llvm-config

# Install Jupyterlab Extensions
COPY ./jupyterlab_extensions.txt jupyterlab_extensions.txt

RUN jupyter serverextension enable --py jupyterlab --sys-prefix && \
    jupyter notebook --generate-config && \
    xargs jupyter labextension install < jupyterlab_extensions.txt && \
    jupyter serverextension enable --py jupyterlab_git && \
    jupyter lab build

# Add local files as late as possible to avoid cache busting
COPY start.sh start-notebook.sh start-singleuser.sh /usr/local/bin/
COPY jupyter_notebook_config.py /etc/jupyter/
RUN fix-permissions /etc/jupyter/

# Switch to jovyan to avoid container running as root
USER ${NB_USER}

WORKDIR /home/${NB_USER}

# Setup work directory for backward-compatibility
RUN mkdir -p "${HOME}/work" "${HOME}/go" "${HOME}/.local/bin" && \
    fix-permissions "${HOME}"

ENV PATH=/home/${NB_USER}/.local/bin:${PATH}

EXPOSE 8888

# Configure container startup
ENTRYPOINT ["tini", "-g", "--"]
CMD ["start-notebook.sh"]
