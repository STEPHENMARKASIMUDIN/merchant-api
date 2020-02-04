import { Request, Response } from 'express';
import ResJson from '../helpers/responseJson';
import ResMsg from '../helpers/responseMessage';
import logger from '../helpers/logger';
import { QuerySalesReport } from '../helpers/RequestQuery';
import { SalesReportResponse } from '../helpers/Response';
import { get, RequestCallback, Options } from 'request';
import { reqOptions, logLevel, getToken, optionsWithAuth } from '../helpers/Functions';


function SalesReport(req: Request, res: Response) {

  const { date, month, range, vendor, year }: QuerySalesReport = req.query;
  const t = getToken(req);
  const areRequiredParametersNotProvided = (!vendor || !range);
  if (areRequiredParametersNotProvided || !['DAILY', 'MONTHLY'].includes(range)) {
    logger('error', ResMsg(16), '[SalesReport]');
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    var opts: Options;
    switch (range) {
      case 'DAILY':
        opts = optionsWithAuth(reqOptions('sale_reports', { qs: { date, range, vendor } }, false), t.token);
        break;
      default:
        if (!month || !year) {
          logger('error', 'Required Parameter is Missing. | Monthly', '[SalesReport]');
          return res.json(ResJson(463, ResMsg(16))).end();
        }
        opts = optionsWithAuth(reqOptions('sale_reports', { qs: { year, month, range, vendor } }, false), t.token);
        break;
    }
    const SalesReportRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message = 'socket hang up') {
          resmsg = ResMsg(2);
        }
        logger('error', e.message, '[SalesReport requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      } else {
        const { ResponseCode, ResponseMessage, sales_data }: SalesReportResponse = JSON.parse(b)
        logger(logLevel(ResponseCode), ResponseMessage, '[SalesReport requestCB]');
        switch (ResponseCode) {
          case 200:
            return res.json(ResJson(200, ResponseMessage, sales_data)).end();
          default:
            return res.json(ResJson(ResponseCode, ResponseCode === 404 ? 'No Data Found.' : ResponseMessage)).end();
        }
      }
    }
    get(opts, SalesReportRequestCallback);
  }
}


export default SalesReport;
