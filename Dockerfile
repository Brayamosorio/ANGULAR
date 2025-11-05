FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --fund false

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist/proyecto4-angular-js/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O - http://localhost/ || exit 1
