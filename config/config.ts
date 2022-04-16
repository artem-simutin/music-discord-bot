const dotenv = require('dotenv')
dotenv.config()

type EnvType = 'production' | 'development'

const config = {
  BUILD_MODE: process.env.BUILD_MODE as EnvType | undefined,
  token: process.env.BOT_TOKEN,
  prefix: '!!',
  botDisconnectTimeout: 300000,
}

export default config
