console.clear()

import config from '../config/config'
import { Client } from './structures/client'

const client = new Client()

client.start(config.token)
