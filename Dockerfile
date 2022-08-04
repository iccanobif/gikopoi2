FROM node:14-alpine
RUN apk add git
ADD . /gikopoipoi
WORKDIR /gikopoipoi
RUN yarn install
CMD ["yarn", "dev"]