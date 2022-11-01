FROM --platform=linux/amd64 node:18.7.0
# Create the bot's directory
RUN mkdir -p /bot
WORKDIR /bot
COPY package.json /bot
RUN apt-get update && apt-get install -y gcc
RUN yarn
COPY . /bot
# Start the bot.
CMD ["yarn", "start"]