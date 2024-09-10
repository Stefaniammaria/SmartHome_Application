# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

ENV REACT_APP_USERHOST http://localhost:4000
ENV REACT_APP_DEVICEHOST http://localhost:4004
ENV REACT_APP_SOCKETURL http://localhost:4008/ws
ENV REACT_APP_CHATHOST http://localhost:4012
ENV REACT_APP_CHATSOCKETURL http://localhost:4012/ws

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# new
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]