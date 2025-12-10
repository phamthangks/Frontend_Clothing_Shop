# Stage 1: Build ứng dụng Angular
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build --configuration production


# Stage 2: Serve với Nginx
FROM nginx:alpine
COPY --from=build /app/dist/clothing-shop /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
