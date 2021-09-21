FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["node > refworks_log.log 2> refworks_err_log.log", "bin/www"]