import { generateDependencyReport } from '@discordjs/voice'
import chalk from 'chalk'
import config from '../../../config/config'
import ExceptionHandler from './exceptionHandler'

const BUILD_MODE = config.BUILD_MODE
  ? config.BUILD_MODE
  : 'development (using "development" by default)'
class Logger extends ExceptionHandler {
  /**
   * Returns true if environment is in production mode, otherwise false
   * @returns boolean
   */
  private static isEnvironmentInProduction() {
    if (config.BUILD_MODE === 'production') return true
    return false
  }

  /**
   * Executes function only in development mode
   */
  private static exec(func: object) {
    if (this.isEnvironmentInProduction()) return
    if (typeof func !== 'function') return
    func()
  }

  /**
   * =============================================
   * =           Info / Warning / Error          =
   * =============================================
   */

  /**
   * Log info message for dev env
   */
  public static info(message: string) {
    this.exec(() =>
      console.log(`${chalk.blueBright.bold('[INFO]')} - ${message}`)
    )
  }

  /**
   * Log warnign message for dev env
   */
  public static warn(message: string) {
    this.exec(() =>
      console.log(`${chalk.yellowBright.bold('[WARN]')} - ${message}`)
    )
  }

  /**
   * Log error and send to database
   * TODO: implement logic for sending error messages to the Database
   */
  public static error(message: string) {
    console.log(`${chalk.redBright.bold('[ERROR]')} - ${message}`)
  }

  /**
   * =============================================
   * =               Initial logs                =
   * =============================================
   */
  public static command(name: string) {
    console.log(
      `Command ### ${chalk.magenta(name)} ### ${chalk.green('loaded')}`
    )
    return
  }

  public static event(name: string) {
    console.log(`Command ### ${chalk.cyan(name)} ### ${chalk.green('loaded')}`)
    return
  }

  public static connected() {
    console.log(' ')
    console.log(' ')
    console.log(
      chalk.greenBright('=============================================')
    )
    console.log(
      chalk.greenBright('=               BOT IS READY                =')
    )
    console.log(
      chalk.greenBright('=============================================')
    )
  }

  public static dependencies() {
    console.log(
      chalk.whiteBright.bold(
        '=== The information about dependencies and core libraries ==='
      )
    )

    console.log(generateDependencyReport())

    console.log(' ')
    console.log(' ')

    return
  }

  public static environment() {
    // Clean up the console before start only for dev mode
    if (BUILD_MODE !== 'production') {
      console.clear()
      Logger.dependencies()
    }

    console.log(`Build mode: ${chalk.blue(BUILD_MODE)}`)
  }
}

export default Logger
