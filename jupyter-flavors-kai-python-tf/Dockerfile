FROM jupyter/scipy-notebook:latest

# Maintainer of the Dockerfile
LABEL maintainer "Intelygenz - Konstellation Team"

# Input data
ENV DEBIAN_FRONTEND=noninteractive \
        TZ=Europe/Madrid

ARG VERSION=2.5.0

USER root

# Install OS dependencies required for the kernel-wrapper. Missing
# packages can be installed later only if container is running as
# privileged user.
RUN apt-get update && apt-get install -yq --no-install-recommends \
    build-essential \
    curl \
    libsm6 \
    libxext-dev \
    libxrender1 \
    netcat \
    python3-dev \
    tzdata \
    unzip \
    # VSCODE
    # Install required packages && configure sshd
    # Requirements
    # https://code.visualstudio.com/docs/remote/linux
    curl \
    openssh-server && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config && \
    sed -i 's/#Port 22/Port 2222/g' /etc/ssh/sshd_config && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1000 jovyan && \
    usermod -g 1000 jovyan

# Install any packages required for the kernel-wrapper.  If the image
# does not contain the target kernel (i.e., IPython, IRkernel, etc.,
# it should be installed as well.
RUN pip install \
    pycrypto \
    future \
    numpy \
    pandas \
    matplotlib \
    scikit-learn \
    scipy \
    requests 

# Download and extract the enterprise gateway kernel launchers and bootstrap
# files and deploy to /usr/local/bin. Change permissions to NB_UID:NB_GID.
RUN curl -L https://github.com/jupyter/enterprise_gateway/releases/download/v${VERSION}/jupyter_enterprise_gateway_kernel_image_files-${VERSION}.tar.gz | \
    tar -xz -C /usr/local/bin 

RUN chown jovyan:users /usr/local/bin/bootstrap-kernel.sh && \
    chmod 0755 /usr/local/bin/bootstrap-kernel.sh && \
    chown -R jovyan:users /usr/local/bin/kernel-launchers

USER jovyan

ENV KERNEL_LANGUAGE python

CMD /usr/local/bin/bootstrap-kernel.sh