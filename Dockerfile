FROM strapi/base
# Let WatchTower know to ignore this container for checking
LABEL com.centurylinklabs.watchtower.enable="false"
WORKDIR /srv/app
COPY ./app/package*.json ./
RUN npm ci
COPY ./app/ /srv/app
RUN npm run build
EXPOSE 1337
ENV NODE_ENV production
CMD ["npm", "start"]