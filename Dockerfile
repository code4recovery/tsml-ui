FROM node:gallium-alpine

RUN apk add g++ make build-base autoconf libtool nasm libpng-dev automake python3-dev git --no-cache

RUN npm install -g npm@8.12.1
RUN yarn global add rollup

RUN chown -R 1000:1000 /root/

WORKDIR /usr/src/apps

CMD ["rollup", "--help"]
