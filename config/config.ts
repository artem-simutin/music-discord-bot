const dotenv = require('dotenv')
dotenv.config()

export type EnvType = 'production' | 'development'

console.log('env', process.env.NODE_ENV)

const config = {
  NODE_ENV: process.env.NODE_ENV as EnvType | undefined,
  token: process.env.BOT_TOKEN,
  prefix: '!!',
  botDisconnectTimeout: 300000,
}

export default config
