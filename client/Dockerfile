FROM node:16.13.1 as builder

WORKDIR /app

COPY ./package.json /app

RUN yarn install

COPY . /app

RUN yarn run build

FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]