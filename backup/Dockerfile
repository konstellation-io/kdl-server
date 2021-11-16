FROM amazon/aws-cli:2.2.45

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

#COPY ./files/mongodb-org-4.2.repo /etc/yum.repos.d/mongodb-org-4.2.repo
COPY ./files/mongodb-org-4.2.repo /etc/yum.repos.d/

WORKDIR /

RUN curl -o mongo-tools.rpm https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.2/x86_64/RPMS/mongodb-org-tools-4.2.9-1.amzn2.x86_64.rpm && \
    yum install -y --setopt=tsflags=nodocs \
        gzip \
        mongo-tools.rpm \
        tar && \
    amazon-linux-extras install -y \
        postgresql12 && \
    yum clean all 

ENTRYPOINT [""]
