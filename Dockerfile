# Use an official Node.js LTS (Long Term Support) image as the base
FROM node:lts-alpine

WORKDIR /app/

COPY ./package*.json ./

RUN npm ci --production

COPY ./public ./src ./database ./config ./

ENV NODE_ENV production

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]