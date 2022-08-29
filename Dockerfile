FROM node:16-alpine

EXPOSE 8085

# git needed by yarn
RUN apk add git

# yarn install
WORKDIR /gikopoipoi
ADD package.json ./package.json
ADD yarn.lock ./yarn.lock
ADD tripcode ./tripcode
RUN yarn install

ADD . .
RUN yarn build
CMD ["node", "build/index.js"]