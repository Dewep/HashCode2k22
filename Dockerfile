FROM node:16-alpine

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

COPY ./package*.json /app/

RUN npm install --production
COPY . /app
RUN ls -l /app

CMD [ "node", "/opt/app/scripts/example" ]
