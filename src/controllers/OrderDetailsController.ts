import ResJson from '../helpers/responseJson';
import ResMsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import { Request, Response } from 'express';
import { QueryOrderDetails } from '../helpers/RequestQuery';
import { get, RequestCallback } from 'request';
import { OrderDetailsResponse } from '../helpers/Response';
import { reqOptions, getToken, optionsWithAuth } from '../helpers/Functions';



function OrderDetails(req: Request, res: Response): void {

  const { orderno, shopName }: QueryOrderDetails = req.query;

  const areAllParametersNotProvided = (!orderno || !shopName);

  if (areAllParametersNotProvided) {
    loggerMerchant('error', `Required Parameter is/are Missing.`, '[OrderDetails]');
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const opts = reqOptions('order_details', { qs: { orderno, vendor: shopName } }, false);

    const orderDetailsRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let remsg = ResMsg(0);
        if (e.message == 'socket hang up') {
          remsg = ResMsg(2);
        }
        loggerMerchant('error', e.message, '[Products requestCB err]');
        return res.json(ResJson(500, remsg)).end();
      } else {
        const { ResponseCode, ResponseMessage, Order_List }: OrderDetailsResponse = JSON.parse(b);
        switch (ResponseCode) {
          case 200:
            return res.json(ResJson(200, ResponseMessage, Order_List));
          default:
            return res.json(ResJson(ResponseCode, ResponseMessage)).end();
        }
      }
    };
    get(optionsWithAuth(opts, getToken(req).token), orderDetailsRequestCallback);
  }

}


export default OrderDetails;

