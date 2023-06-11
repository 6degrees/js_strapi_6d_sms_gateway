FROM strapi/base

# Let WatchTower know to ignore this container for checking
LABEL com.centurylinklabs.watchtower.enable="false"

WORKDIR /app

COPY ./package*.json ./
COPY ./.env.example ./stack.env
# COPY ./.env ./

RUN npm ci

COPY . .

ENV NODE_ENV production

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]
