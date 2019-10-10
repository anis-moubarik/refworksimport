FROM node:8-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["node", "bin/www"]