import { generateDependencyReport } from '@discordjs/voice'
import config from '../config/config'
import { Client } from './structures/client'
// import chalk from 'chalk'

const buildMode = process.env.BUILD_MODE
  ? process.env.BUILD_MODE
  : 'development (using "development" by default)'

// Clean up the console before start only for dev mode
if (buildMode !== 'production') {
  console.clear()
}

if (buildMode !== 'production') {
  // console.log(
  //   chalk.bgCyan.bold('The information about dependencies and core libraries')
  // )
  console.log(generateDependencyReport())
}

console.log(`Build mode: ${buildMode}`)

const client = new Client()

if (config.token) {
  client.start(config.token)
} else {
  console.error(
    'Please, provide bot token as env variable (info: .env.example)'
  )
}
