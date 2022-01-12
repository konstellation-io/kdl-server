FROM jupyter/base-notebook:latest

# Maintainer of the Dockerfile
LABEL maintainer "Intelygenz - Konstellation Team"

ARG VERSION=2.5.0

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

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
    ## CUDA SPECIFIC
    gcc-8 && \
    groupadd -g 1000 jovyan && \
    usermod -g 1000 jovyan

# Install any packages required for the kernel-wrapper.  If the image
# does not contain the target kernel (i.e., IPython, IRkernel, etc.,
# it should be installed as well.
RUN pip install pycrypto future

# Download and extract the enterprise gateway kernel launchers and bootstrap
# files and deploy to /usr/local/bin. Change permissions to NB_UID:NB_GID.
RUN curl -L https://github.com/jupyter/enterprise_gateway/releases/download/v${VERSION}/jupyter_enterprise_gateway_kernel_image_files-${VERSION}.tar.gz | \
    tar -xz -C /usr/local/bin && \
    chown jovyan:jovyan /usr/local/bin/bootstrap-kernel.sh && \
    chmod 0755 /usr/local/bin/bootstrap-kernel.sh && \
    chown -R jovyan:jovyan /usr/local/bin/kernel-launchers

# Clean up
RUN rm --recursive --force -- /tmp/* && \
        apt-get clean && apt-get autoremove -y && \
        rm -rf /var/lib/{apt,dpkg,cache,log}/

USER jovyan

ENV KERNEL_LANGUAGE python

CMD /usr/local/bin/bootstrap-kernel.sh