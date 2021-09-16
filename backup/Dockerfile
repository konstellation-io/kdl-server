FROM amazon/aws-cli:2.2.38

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

WORKDIR /

RUN yum -y --setopt=tsflags=nodocs install \
    postgresql tar gzip && \
    yum clean all

ENTRYPOINT [""]
