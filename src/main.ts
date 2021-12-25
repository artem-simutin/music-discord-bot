console.clear()

import { generateDependencyReport } from '@discordjs/voice'
import config from '../config/config'
import { Client } from './structures/client'

console.log(generateDependencyReport())

const client = new Client()

console.log(
  'Build mode: ' + process.env.BUILD_MODE
    ? process.env.BUILD_MODE
    : '(using "development" by default)'
)

if (config.token) {
  client.start(config.token)
} else {
  console.error(
    'Please, provide bot token as env variable (info: .env.example)'
  )
}
