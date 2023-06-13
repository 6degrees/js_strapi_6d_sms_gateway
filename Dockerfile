# Use an official Node.js LTS (Long Term Support) image as the base
FROM node:lts-alpine

WORKDIR /app

COPY ./app/package*.json ./

RUN npm ci --production

COPY ./app .

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]
