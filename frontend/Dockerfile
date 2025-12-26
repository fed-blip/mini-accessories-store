FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5500

CMD ["npx", "live-server", "--port=5500", "--host=0.0.0.0"]
