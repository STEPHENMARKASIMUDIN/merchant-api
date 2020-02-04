
import resJson from '../helpers/responseJson';
import Respmsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import { Request, Response } from 'express';
import { OrderInvoiceResponse } from '../helpers/Response';
import { get, RequestCallback } from 'request';
import { QueryStringOrdersDetails } from './../helpers/RequestQuery';
import { reqOptions, logLevel, getToken, optionsWithAuth } from '../helpers/Functions';


function OrderInvoice(req: Request, res: Response) {

  const { shopName, orderNO, orderID }: QueryStringOrdersDetails = req.query;
  const areParametersNotProvided = (!shopName || !orderID || !orderNO);
  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are missing.', '[OrderInvoice]')
    return res.json(resJson(500, Respmsg(0))).end();
  } else {

    const orderInvoiceRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let resmsg = Respmsg(0);
        if (e.message == 'socket hang up') {
          resmsg = Respmsg(2);
        }
        loggerMerchant('error', e.message, '[OrderInvoice requestCB err]')
        return res.json(resJson(500, resmsg)).end();
      } else {
        const { ResponseCode, ResponseMessage, payment_invoice }: OrderInvoiceResponse = JSON.parse(b);
        loggerMerchant(logLevel(ResponseCode), ResponseMessage, '[OrderInvoice requestCB]');
        switch (ResponseCode) {
          case 200:
            return res.json(resJson(ResponseCode, ResponseMessage, payment_invoice));
          default:
            return res.json(resJson(ResponseCode, ResponseMessage));
        }
      }
    }
    get(optionsWithAuth(reqOptions('order_invoice', {
      qs: {
        vendor: shopName,
        orderno: orderNO,
        order_id: orderID
      }
    }, false), getToken(req).token), orderInvoiceRequestCallback);
  }

}

export default OrderInvoice;