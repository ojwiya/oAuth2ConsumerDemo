
FROM node:6.9

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app

ENV NODE_ENV=production

RUN npm install

EXPOSE 3000

CMD [ "node", "server.js" ]