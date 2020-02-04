import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { Request, Response } from 'express';
import { get, RequestCallback } from 'request';
import { DashboardDataResponse } from '../helpers/Response';
import { reqOptions, logLevel, getToken, optionsWithAuth } from '../helpers/Functions';

function DashboardData(req: Request, res: Response): any {


  const dashboardDataRequestCallback: RequestCallback = (e: Error, r, b): void => {
    if (e) {
      let resmsg = ResMsg(0);
      if (e.message = 'socket hang up') {
        resmsg = ResMsg(2);
      }
      loggerMerchant('error', e.message, '[DashboardData requestCB err]');
      return res.json(ResJson(500, resmsg)).end();
    } else {
      const { Order_Earnings,
        Recent_Orders, ResponseCode, ResponseMessage }: DashboardDataResponse = JSON.parse(b);
      loggerMerchant(logLevel(ResponseCode), ResponseMessage, '[DashboardData requestCB]');
      return res.json(ResJson(ResponseCode,
        ResponseMessage, { Order_Earnings, Recent_Orders })).end();

    }
  }
  get(optionsWithAuth(reqOptions('dashboard', { qs: { vendor: req.query.shopName } }, false), getToken(req).token), dashboardDataRequestCallback);

}

export default DashboardData;




