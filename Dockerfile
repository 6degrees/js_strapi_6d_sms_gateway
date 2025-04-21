# Reference: https://docs.docker.com/language/nodejs/build-images/

FROM node:16-slim AS base

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl libvips-dev build-essential python3
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN npm ci --only=production

FROM base AS build
RUN npm ci
RUN npm run build

FROM base
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
# Rebuild Sharp for the current environment
RUN cd /app && npm rebuild sharp --platform=linux --arch=x64
EXPOSE 1337
CMD ["npm", "start"]