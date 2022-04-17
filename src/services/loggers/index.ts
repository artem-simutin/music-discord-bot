import chalk from 'chalk'
import config from '../../../config/config'
import ExceptionHandler from './exceptionHandler'

class Logger extends ExceptionHandler {
  private static isEnvironmentInProduction() {
    if (config.BUILD_MODE === 'production') return true
    return false
  }

  /**
   * Log info message for dev env
   */
  public static info(message: string) {
    const isProduction = this.isEnvironmentInProduction()

    if (isProduction) return

    console.log(`${chalk.blueBright.bold('[INFO]')} - ${message}`)
  }

  /**
   * Log warnign message for dev env
   */
  public static warn(message: string) {
    const isProduction = this.isEnvironmentInProduction()

    if (isProduction) return

    console.log(`${chalk.yellowBright.bold('[WARN]')} - ${message}`)
  }

  /**
   * Log error and send to database
   * TODO: implement logic for sending error messages to the Database
   */
  public static error(message: string) {
    console.log(`${chalk.redBright.bold('[ERROR]')} - ${message}`)
  }
}

export default Logger
