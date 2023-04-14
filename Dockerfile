FROM node:16-alpine

EXPOSE 8085

# git needed by yarn
RUN apk add git

# yarn install
WORKDIR /gikopoipoi
ADD package.json ./package.json
ADD yarn.lock ./yarn.lock
ADD tripcode ./extra_modules/tripcode
RUN yarn install

ADD . .
RUN yarn build
CMD ["node", "build/index.js"] # The server files are currently not built anywhere so not sure what this should be right now
