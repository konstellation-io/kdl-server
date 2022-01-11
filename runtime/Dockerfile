# FROM nvidia/cuda:11.2.2-cudnn8-runtime-ubuntu20.04
FROM python:3.9.1-slim-buster

# Maintainer of the Dockerfile
LABEL maintainer "Intelygenz - Konstellation Team"

# Input data
ENV DEBIAN_FRONTEND noninteractive
ENV TZ=Europe/Madrid

ARG NON_ROOT_USER=nroot
ARG ID=1000

# Switch to ROOT user to do maintenance tasks
USER root

# Set workdir to tmp
WORKDIR /tmp

# Copy files to the container
COPY scripts/motd /etc/update-motd.d/
COPY requirements.txt /tmp/

# Install required packages && configure sshd
# Requirements
# https://code.visualstudio.com/docs/remote/linux
RUN apt-get update && apt-get install -yq --no-install-recommends \
        curl \
        openssh-server && \
        sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config && \
        sed -i 's/#Port 22/Port 2222/g' /etc/ssh/sshd_config

# Install Python libraries
RUN pip install --upgrade pip && \
        pip install --no-cache-dir -r requirements.txt

# Create a non-root user && clean up && create /run/sshd
# Bash is required to let the extension install its stuff !!!
RUN groupadd ${NON_ROOT_USER} --gid ${ID}                                  && \
        useradd ${NON_ROOT_USER} --system --create-home --uid ${ID} --gid ${ID} --shell /bin/bash && \
        chown ${NON_ROOT_USER}:${NON_ROOT_USER} /home/${NON_ROOT_USER} && \
        rm --recursive --force -- * && \
        apt-get clean && apt-get autoremove -y && \
        rm -rf /var/lib/{apt,dpkg,cache,log}/ && \
        mkdir /run/sshd && \
        echo "cat /etc/motd" >> /etc/bash.bashrc

# Use non-root user
# USER ${NON_ROOT_USER}

# Set workdir to user home
# WORKDIR /home/${NON_ROOT_USER}

CMD ["/usr/sbin/sshd", "-D", "-e"]
