# A minimal Docker image with Node and Puppeteer
#
# Based upon:
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

FROM node:12-slim

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

ENV DEBIAN_FRONTEND noninteractive
ENV NODE_ENV production

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
SHELL ["/bin/bash", "-o", "pipefail", "-c"] 
RUN apt-get update && \
    apt-get install -yq --no-install-recommends ca-certificates wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -yq --no-install-recommends google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 && \
    apt-get clean && apt-get autoremove -y && \
    rm -rf /var/lib/{apt,dpkg,cache,log,lists}/*

WORKDIR /usr/src/app

# This layer is not going to be replaced if changes are made in index.js
COPY --chown=node:node package.json package-lock.json /usr/src/app/
RUN npm ci --only=production

# This layer is separated away from the package* files because is more likely to be edited
COPY --chown=node:node index.js /usr/src/app/

USER node

CMD ["npm", "run", "authorize"]
