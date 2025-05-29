FROM node:22 AS build

WORKDIR /app

ARG API_URL

ENV TZ=America/Lima
ENV API_URL=${API_URL}

COPY package*.json ./
RUN npm install

COPY . .

RUN sed -i "s|#{API_URL}#|${API_URL}|g" /app/src/environments/environment.ts

RUN npm run build -- --output-path=dist --configuration=production

FROM nginx:1.17.1-alpine

ENV TZ=America/Lima

COPY --from=build /app/dist/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
