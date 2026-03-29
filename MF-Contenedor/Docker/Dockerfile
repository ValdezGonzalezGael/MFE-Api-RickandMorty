FROM node:20-alpine AS build
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build

FROM nginx:1.25.1-alpine
COPY --from=build /app/Docker/nginxChildren.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html/MF-Contenedor
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
