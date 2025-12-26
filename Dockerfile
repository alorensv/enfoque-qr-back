FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
COPY gen_bcrypt.js ./
RUN npm install --legacy-peer-deps
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
