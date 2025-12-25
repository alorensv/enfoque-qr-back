FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install --legacy-peer-deps
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
