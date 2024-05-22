class Logger {
  constructor() {}

  log(message: string) {
    console.log(`${message}`)
  }
}

const defaultLogger = new Logger()

export default defaultLogger
