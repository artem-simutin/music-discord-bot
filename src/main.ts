console.clear()

import config from '../config/config'
import { Client } from './structures/client'

const client = new Client()

console.log(process.env.BUILD_MODE)

if (config.token) {
  client.start(config.token)
} else {
  console.error(
    'Please, provide bot token as env variable (info: .env.example)'
  )
}
