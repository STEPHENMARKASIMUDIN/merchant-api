import { LoggerBody } from './../helpers/RequestBody';
import { Request, Response } from 'express';
import ResJson from '../helpers/responseJson';
import ResMsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';

const LoggerUIController = (req: Request, res: Response) => {
  const { messageOccurred, reason, info }: LoggerBody = req.body;
  try {
    loggerMerchant('error', `[Error: ${reason} Occurred at ${messageOccurred}]`, `[Logger UI]`, true);
    loggerMerchant('error', `[Additional Info: ${info} Occurred at ${messageOccurred}]`, `[Logger UI]`, true);
    res.json(ResJson(200, ResMsg(28))).end();
  } catch (e) {
    loggerMerchant('error', `[Error: ${e.message}]`, `[Logger UI]`, true);
    res.json(ResJson(500, ResMsg(17))).end();
  }


};

export default LoggerUIController;