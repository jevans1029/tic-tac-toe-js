FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY index.html /usr/share/nginx/html
COPY register.html /usr/share/nginx/html
COPY js/* /usr/share/nginx/html/js/
COPY css/* /usr/share/nginx/html/css/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
