const dotenv = require('dotenv')
dotenv.config()

const config = {
  BUILD_MODE: process.env.BUILD_MODE,
  token: process.env.BOT_TOKEN,
  prefix: '!!',
}

export default config
