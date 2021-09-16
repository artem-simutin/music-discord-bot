const dotenv = require('dotenv');
dotenv.config();

const config = {
  token: process.env.BOT_TOKEN,
  prefix: '!!',
};

export default config;
