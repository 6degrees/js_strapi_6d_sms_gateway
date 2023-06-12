FROM strapi/base

# Let WatchTower know to ignore this container for checking
LABEL com.centurylinklabs.watchtower.enable="false"

WORKDIR /app

COPY ./app/package*.json ./

RUN npm ci

COPY ./app .

ENV NODE_ENV production

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]