FROM node:19.2.0
RUN mkdir -p /bot
WORKDIR /bot
COPY package.json /bot
RUN npm install
COPY . /bot
RUN npm run build
CMD ["npm", "run", "start:production"]