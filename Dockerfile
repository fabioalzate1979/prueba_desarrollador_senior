FROM node:20-alpine

WORKDIR /root/

COPY package.json ./

RUN yarn install --production=true

COPY ./dist ./dist/

COPY .env ./

EXPOSE 8080

CMD ["yarn", "build && yarn", "start"]
