FROM carto/nodejs6-xenial-pg101

RUN set -ex \
    && npm install -g yarn@1.15.2

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
