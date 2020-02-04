import resJson from '../helpers/responseJson';
import Respmsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import { Request, Response } from 'express';
import { get, RequestCallback } from 'request';
import { OrderEarningsResponse } from '../helpers/Response';
import { QueryStringOrderEarnings } from './../helpers/RequestQuery';
import { reqOptions, getToken, optionsWithAuth } from '../helpers/Functions';



function OrderEarnings(req: Request, res: Response): any {

  const { shopName, from, to }: QueryStringOrderEarnings = req.query;

  const areParametersNotProvided = (!shopName || !from || !to);
  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are missing.', '[OrderEarnings]');
    return res.json(resJson(500, Respmsg(0))).end();
  } else {
    const OrderEarningsRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let resmsg = Respmsg(0);
        if (e.message == 'socket hang up') {
          resmsg = Respmsg(2);
        }
        loggerMerchant('error', e.message, '[OrderEarnings requestCB err]');
        return res.json(resJson(500, resmsg)).end();
      } else {
        const { ResponseCode, ResponseMessage, Order_Earnings, }: OrderEarningsResponse = JSON.parse(b);
        loggerMerchant('info', ResponseMessage, '[OrderEarnings requestCB]');
        switch (ResponseCode) {
          case 200:
            return res.json(resJson(ResponseCode, ResponseMessage, Order_Earnings)).end();
          default:
            return res.json(resJson(ResponseCode, ResponseMessage)).end();
        }
      }
    }

    get(optionsWithAuth(reqOptions('order_earnings', {
      qs: {
        vendor: shopName,
        limit_from: from,
        limit_to: to
      }
    }, false), getToken(req).token), OrderEarningsRequestCallback);
  }
}


export default OrderEarnings;