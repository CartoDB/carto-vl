ARG image=carto/nodejs-xenial-pg1121
FROM ${image}

ARG node_version=10.15.1
ARG node_version_options=--lts

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION_OPTIONS ${node_version_options}
ENV NODE_VERSION ${node_version}

RUN set -ex \
    && . ~/.nvm/nvm.sh \
    && nvm install $NODE_VERSION $NODE_VERSION_OPTIONS \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

WORKDIR /srv

COPY config/ ./config/
COPY test/ ./test/
COPY prepare.sh ./
RUN set -ex \
    && /etc/init.d/postgresql start \
    && bash prepare.sh

WORKDIR /mnt
COPY deploy.sh ./

ENTRYPOINT [ "./deploy.sh" ]

EXPOSE 8181
