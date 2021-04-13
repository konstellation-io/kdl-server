FROM python:3.9-slim

# Create kdl user.
ENV USER=kdl
ENV UID=10001
ENV ASSET_COMMIT="558ea7724d7ac7c4787856535372503e7c4bbf73"
ENV REPO_URL="https://github.com/konstellation-io/kdl-server"
ENV PYTHONPATH="/kg/src"

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistant" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN apt-get update \
    && apt-get install -y build-essential wget git

WORKDIR /kg

COPY Pipfile* ./
RUN python3 -m pip install pipenv && \
    pipenv install --system --deploy

RUN wget https://github.com/facebookresearch/faiss/archive/refs/tags/v1.7.0.tar.gz && \
    tar -xvzf v1.7.0.tar.gz && \
    wget https://github.com/Kitware/CMake/releases/download/v3.20.1/cmake-3.20.1-linux-x86_64.sh && \
    chmod +x cmake-3.20.1-linux-x86_64.sh && \
    ./cmake-3.20.1-linux-x86_64.sh --skip-license --include-subdir && \
    apt-get install -y libblas-dev liblapack-dev swig

WORKDIR faiss-1.7.0/

RUN ../cmake-3.20.1-linux-x86_64/bin/cmake -B build -DFAISS_ENABLE_GPU=OFF && \
    make -C build -j faiss && \
    make -C build -j swigfaiss && \
    (cd build/faiss/python && python setup.py install)

RUN cp -r build/faiss/python/build/lib/faiss /usr/local/lib/python3.9/site-packages

WORKDIR /kg

RUN rm -rf cmake-3.20.1-linux-x86_64 cmake-3.20.1-linux-x86_64.sh faiss-1.7.0

COPY src/ src/

WORKDIR /kg/assets

RUN dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/vectors.faiss && \
    dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/model && \
    dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/topics.pkl.gz && \
    dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/dataset.pkl.gz

WORKDIR /kg

RUN chown -R kdl:0 /kg \
    && chmod -R g+w /kg \
    && mkdir /var/log/app -p \
    && chown -R kdl:0 /var/log/app \
    && chmod -R g+w /var/log/app

USER kdl

CMD ["sh","-c","/usr/local/bin/python3 /kg/src/server/app.py 2>&1 | tee -a /var/log/app/app.log"]
