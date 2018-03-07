FROM node:8.9-alpine

ARG build_tag=none

ENV BUILD_TAG $build_tag
ENV NODE_ENV production
ENV APP=/myapp
RUN apk update \
    && apk add --no-cache make gcc g++ python git jq

WORKDIR $APP
COPY . .
RUN yarn install

RUN yarn build
CMD yarn start