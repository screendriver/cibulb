FROM node:lts-alpine

USER node

WORKDIR /home/node

COPY package*.json ./

RUN npm ci --only=production

COPY target/src/ .

EXPOSE 8080 8081

CMD [ "node", "--enable-source-maps", "server.js" ]
