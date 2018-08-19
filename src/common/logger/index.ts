import * as Bunyan from 'bunyan'

let bunyan: Bunyan

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export function loggerInit ({
    name ='app' as string,
    consoleLevel = 'debug' as LogLevel,
    fileLevel = 'trace' as LogLevel,
    filePath = './logs' as string,
    fileName = 'log.out' as string,
  } = {}) {
  bunyan = Bunyan.createLogger({
    name: name,
    streams: [
      ConsoleStream(consoleLevel),
      FileStream({
        path: filePath,
        name: fileName,
        level: fileLevel,
      })
    ]
  })

  return new Logger(bunyan)
}

export class Logger {
    constructor (
      private bunyan: Bunyan,
    ) {

    }

    public child (componentName: string) {
      return new Logger(this.bunyan.child({ component: componentName }))
    }
  
    trace (message: string)
    trace (dataOrError: object, message?: string)
    trace (...args) {
      return this.apply('trace', args)
    }
  
    debug (message: string)
    debug (dataOrError: object, message?: string)
    debug (...args) {
      return this.apply('debug', args)
    }
  
    info (message: string)
    info (dataOrError: object, message?: string)
    info (...args) {
      return this.apply('info', args)
    }
  
    warn (message: string)
    warn (dataOrError: object, message?: string)
    warn (...args) {
      return this.apply('warn', args)
    }
  
    error (message: string)
    error (dataOrError: object, message?: string)
    error (...args) {
      return this.apply('error', args)
    }
  
    fatal (message: string)
    fatal (dataOrError: object, message?: string)
    fatal (...args) {
      return this.apply('fatal', args)
    }
  
    private apply (level: LogLevel, args: any[]) {
      this.bunyan[level].apply(this.bunyan, args)
      return this
    }
  }
  
  import { join } from 'path'
  import * as fs from 'fs-extra'
  import BunyanFormat from 'bunyan-format'
  
  /**
   * Console/stdout stream with human-readable formatting,
   * intended human consumption via the Resin dashboard.
   *
   * @param level
   */
  export function ConsoleStream (level: LogLevel) {
    const format = new BunyanFormat({ outputMode: 'short', color: true })
    return {
      level,
      stream: format,
    }
  }
  
  interface FileStreamOptions {
    path: string
    name: string
    level?: LogLevel
    period?: string
    count?: number
  }
  
  /**
   * Low-level JSON log file for detailed analysis and
   * post-mortem debugging.
   *
   * @param path
   * @param file
   */
  export function FileStream ({ path, name, level = 'debug', period = '1d', count = 5 }: FileStreamOptions) {
    return {
      type: 'rotating-file',
      path: setupFile(path, name),
      level,
      period,
      count,
    }
  }
  
  // /**
  //  * Error-only file stream to highlight recurring errors.
  //  *
  //  * @param path
  //  * @param file
  //  */
  // export function ErrorFileStream (path: string, file: string) {
  //   return {
  //     path: setupFile(path, file),
  //     level: 'error',
  //     type: 'rotating-file',
  //     period: '1d',
  //     count: 5,
  //   }
  // }
  
  function setupFile (path: string, file: string) {
    // Create any missing directories in our logging path
    // before attempting to write files into them.
    fs.ensureDirSync(path)
  
    return join(path, file)
  }
  
  export default { Logger }