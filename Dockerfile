# build environment
FROM node:15.5.1-alpine3.10 as build

COPY . /app
WORKDIR /app

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache alpine-sdk python3 openjdk11 && \
    ln -sf python3 /usr/bin/python && \
    python3 -m ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools

RUN yarn && \
    yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/apps/cos-ui/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]