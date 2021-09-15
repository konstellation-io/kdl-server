FROM amazon/aws-cli:2.2.38

# Maintainer of the Dockerfile
LABEL maintainer "Intelygenz - Konstellation Team"

# Input data
ARG NON_ROOT_USER=nroot

# Change to ROOT user to do maintenance/install tasks
USER root

# Working directory
WORKDIR /tmp

RUN yum -y --setopt=tsflags=nodocs install postgresql && 
