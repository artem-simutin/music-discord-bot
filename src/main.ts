import config from '../config/config'
import { Client } from './structures/client'
import Logger from './services/loggers'

const client = new Client()

Logger.dependencies()

if (config.token) {
  client.start(config.token)
} else {
  Logger.error('Please, provide bot token as env variable (info: .env.example)')
}
