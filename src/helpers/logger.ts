import { transports, createLogger } from 'winston';
import { join } from 'path';
import { LogLevel } from './Types';

const date = new Date().toJSON().substring(0, 10).trim();



const logger = (wantUILogger = false) => {
  const filename =
    join(`${!wantUILogger ? process.env.LOG_PATH : process.env.LOG_UI_PATH}`, `MLShopMerchantLogs${date}.log`)

  return createLogger({
    transports: [new transports.File({
      level: 'info',
      maxFiles: 3,
      filename,
      maxsize: 5242880
    })]
  });
}


const loggerMerchant = (level: LogLevel, message: string, messageOccurred: string, wantUILogger = false): void => {

  logger().log({
    timestamp: new Date().toJSON(),
    level,
    message,
    messageOccurred
  })


}


export default loggerMerchant;