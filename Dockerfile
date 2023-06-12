FROM strapi/base
LABEL com.centurylinklabs.watchtower.enable="false"
WORKDIR /app
COPY ./src/package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV production
RUN npm run build
EXPOSE 1337
CMD ["npm", "start"]