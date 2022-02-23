# FROM nvidia/cuda:11.2.2-cudnn8-runtime-ubuntu20.04
FROM python:3.9.1-slim-buster

# Maintainer of the Dockerfile
LABEL maintainer "Intelygenz - Konstellation Team"

# Input data
ENV DEBIAN_FRONTEND=noninteractive \
        TZ=Europe/Madrid \
        NODEJS_HOME=/opt/node \
        YARN_HOME=/opt/yarn \
        # Configure jupyter lab environment
        NB_GID="1000" \
        NB_UID="1000" \
        NB_USER="coder" \
        JUPYTERLAB_DIR=/opt/jupyter

ARG NODE_VERSION=14.4.0
ARG YARN_VERSION=1.19.1

# Switch to ROOT user to do maintenance tasks
USER root

# Set workdir to tmp
WORKDIR /tmp

# Set building PATH
ENV PATH=${NODEJS_HOME}/bin:${YARN_HOME}/bin:${PATH}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install required packages
RUN apt-get update && apt-get install -yq --no-install-recommends \
        curl \
        git \
        openssh-server && \
        # Install Node, Yarn
        curl -s -O https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz && \
        curl -sL -O https://yarnpkg.com/downloads/${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz && \
        mkdir -p ${NODEJS_HOME} ${YARN_HOME} && \
        tar zxf node-v${NODE_VERSION}-linux-x64.tar.gz --strip-components 1 -C ${NODEJS_HOME} && \
        tar zxf yarn-v${YARN_VERSION}.tar.gz --strip-components 1 -C ${YARN_HOME}

# Create a non-root user && clean up && create /run/sshd
RUN groupadd ${NB_USER} --gid ${NB_GID} && \
        useradd ${NB_USER} --system --create-home --uid ${NB_UID} --gid ${NB_GID} --shell /bin/bash && \
        chown ${NB_USER}:${NB_GID} /home/${NB_USER} && \
        echo "export PATH=${NODEJS_HOME}/bin:${YARN_HOME}/bin:${PATH}" >> /etc/profile && \
        echo "cat /etc/motd; echo" >> /etc/bash.bashrc

# Copy Jupyter scripts
COPY fix-permissions /usr/local/bin/fix-permissions
COPY jupyter_notebook_config.py /etc/jupyter/

# Make directories writable by the `$NB_UID` group.
RUN fix-permissions /usr/bin /usr/sbin /var/ && \
        fix-permissions /etc/jupyter/

# Required PIP packages
COPY requirements.txt /tmp/

# Install Python libraries
RUN pip install --upgrade --no-cache-dir pip && \
        pip install --no-cache-dir -r /tmp/requirements.txt

# Install Jupyterlab Extensions
COPY jupyterlab_extensions.txt /tmp/

RUN jupyter serverextension enable --py jupyterlab --sys-prefix && \
    jupyter notebook --generate-config && \
    xargs jupyter labextension install < jupyterlab_extensions.txt && \
    jupyter serverextension enable --py jupyterlab_git && \
    jupyter lab build && \
    # Let Jupyterlab install extensions from the Web terminal
    fix-permissions /opt/jupyter

# Clean up
RUN rm --recursive --force -- /tmp/* && \
        apt-get clean && apt-get autoremove -y && \
        rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
        jupyter-lab clean && jlpm cache clean --force

# Use non-root user
USER ${NB_USER}

# Set workdir to user home
WORKDIR /home/${NB_USER}

ENTRYPOINT ["jupyter-lab"]
CMD ["--LabApp.token=''"]
