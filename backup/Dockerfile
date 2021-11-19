FROM amazon/aws-cli:2.2.45

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

# Hadolint DL4006
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Input data
ARG NON_ROOT_USER=nroot
ARG ID=1000

# Change to ROOT user to do maintenance/install tasks
USER root

# Working directory
WORKDIR /tmp

RUN curl -o mongo-tools.rpm https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.2/x86_64/RPMS/mongodb-org-tools-4.2.9-1.amzn2.x86_64.rpm && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && mv kubectl /usr/local/bin && \
    yum install -y --setopt=tsflags=nodocs \
        gzip \
        mongo-tools.rpm \
        shadow-utils \
        tar && \
    amazon-linux-extras install -y \
        postgresql12 && \
    yum clean all

# Clean up tmp directory
RUN rm --recursive --force -- * && \
    rm --recursive --force -- /var/cache/yum

# Create a non-root user and a backup readable dir for the user
RUN groupadd ${NON_ROOT_USER} --gid ${ID} && \
    useradd ${NON_ROOT_USER} --system --create-home --uid ${ID} --gid ${ID} && \
    chown ${NON_ROOT_USER}:${NON_ROOT_USER} /home/${NON_ROOT_USER} && \
    mkdir -p -mg=w /backup

# Copy script file to workdir
COPY ./files/backup-script.sh /home/${NON_ROOT_USER}

# Use non-root user
USER ${NON_ROOT_USER}

# Set workdir to user home
WORKDIR /home/${NON_ROOT_USER}

# Execute script on run
ENTRYPOINT ["./backup-script.sh"]
