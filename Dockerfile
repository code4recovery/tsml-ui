FROM node:gallium-alpine

RUN apk add g++ make build-base autoconf libtool nasm libpng-dev automake python3-dev git --no-cache

RUN yarn global add rollup

WORKDIR /usr/src/apps

CMD ["rollup", "--help"]
