FROM arm64v8/node:19.2.0
RUN mkdir -p /bot
WORKDIR /bot
COPY package.json /bot
RUN apt-get update
RUN apt-get install -y libtool
RUN apt-get install -y automake
RUN apt-get install -y autoconf
RUN apt-get install -y build-essential
RUN apt-get install -y ansible
RUN npm install -g node-gyp
RUN npm install
COPY . /bot
RUN npm run build
CMD ["npm", "run", "start:production"]