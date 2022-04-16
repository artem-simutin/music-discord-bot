import chalk from 'chalk'
import config from '../../../config/config'

class Logger extends ExceptionHandler {
  private static checkEnvironmentForNonProduction() {
    if (config.BUILD_MODE === 'production') return
  }

  /**
   * Log info message for dev env
   */
  public static info(message: string) {
    this.checkEnvironmentForNonProduction()
    console.log(`${chalk.blueBright.bold('[INFO]')} - ${message}`)
  }

  /**
   * Log warnign message for dev env
   */
  public static warn(message: string) {
    this.checkEnvironmentForNonProduction()
    console.log(`${chalk.yellowBright.bold('[WARN]')} - ${message}`)
  }

  /**
   * Log error and send to database
   * TODO: implement logic for sending error messages to the Database
   */
  public error(message: string) {
    console.log(`${chalk.redBright.bold('[ERROR]')} - ${message}`)
  }
}

export default Logger
