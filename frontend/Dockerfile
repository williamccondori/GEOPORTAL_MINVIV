FROM node:19-alpine AS builder

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

ARG BASE_URL

ENV BASE_URL=$BASE_URL
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run generate

FROM node:lts-alpine AS runner

RUN npm install -g http-server

WORKDIR /app

COPY --from=builder /src/dist /app/dist

EXPOSE 80

CMD [ "http-server", "dist", "-p", "80" ]
