FROM node:20

WORKDIR /src

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV PATH /src/node_modules/.bin:$PATH
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 