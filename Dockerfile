FROM node:alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY app/package.json /home/node/app/

USER node

RUN npm install

COPY --chown=node:node app/public /home/node/app/public
COPY --chown=node:node app/src /home/node/app/src

EXPOSE 3000

CMD [ "npm", "start" ]