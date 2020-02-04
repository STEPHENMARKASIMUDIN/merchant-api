import resJson from '../helpers/responseJson';
import Respmsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import { OrdersResponse } from '../helpers/Response';
import { Request, Response } from 'express';
import { QueryStringOrders } from './../helpers/RequestQuery';
import { get, RequestCallback } from 'request';
import { logLevel, reqOptions, getToken, optionsWithAuth } from '../helpers/Functions';



function Orders(req: Request, res: Response) {


  const { shopName, from, to }: QueryStringOrders = req.query;
  const areParametersNotProvided = (
    !shopName || !from || !from
  )
  if (areParametersNotProvided) {
    loggerMerchant('error', `Required Parameter is/are Missing.`, '[Orders - Required Parameter is Missing.]');
    return res.json(resJson(500, Respmsg(0))).end();
  } else {

    const ordersRequestCallback: RequestCallback = (e: Error, r,
      b) => {
      if (e) {
        let resmsg = Respmsg(0)
        if (e.message == 'socket hang up') {
          resmsg = Respmsg(2);
        }
        loggerMerchant('error', `${e['code']} - ${e.message}`, '[Orders - Request Callback err.]');
        return res.json(resJson(500, resmsg));
      } else {
        const { ResponseCode, ResponseMessage, Order_List }: OrdersResponse = JSON.parse(b);
        loggerMerchant(logLevel(ResponseCode), `${ResponseCode} - ${ResponseMessage}`, '[Orders - Request Callback.]');
        switch (ResponseCode) {
          case 200:
            return res.json(resJson(ResponseCode, ResponseMessage, Order_List));
          default:
            return res.json(resJson(ResponseCode, ResponseMessage));
        }
      }
    }
    get(optionsWithAuth(reqOptions('orders', {
      qs: {
        vendor: shopName,
        limit_from: from,
        limit_to: to
      }
    }, false), getToken(req).token), ordersRequestCallback);
  }

}

export default Orders;