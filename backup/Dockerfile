FROM amazon/aws-cli:2.2.45

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

WORKDIR /

RUN yum install -y --setopt=tsflags=nodocs \
        tar gzip && \
    amazon-linux-extras install -y postgresql12 && \
    yum clean all 

ENTRYPOINT [""]
