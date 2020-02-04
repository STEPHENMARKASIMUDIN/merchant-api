import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { MLShopAPIResponse } from '../helpers/Response';
import { Request, Response } from 'express';
import { PaymentDetailsBody } from './../helpers/RequestBody';
import { post, RequestCallback } from 'request';
import { reqOptions, logLevel, getToken, optionsWithAuth } from '../helpers/Functions';


function PaymentDetailsController(req: Request, res: Response): void {

  const body: PaymentDetailsBody = req.body;

  const areParemetersNotProvided = (
    !body.account_number || !body.bank_name
    || !body.cardholder_name || !body.email || !body.merchant_id
    || !body.payment_method || !body.seller_name)

  if (areParemetersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are missing.', '[PaymentDetails]');
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const paymentDetailsRequestCallback: RequestCallback = (e: Error, r, b: MLShopAPIResponse) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message == 'socket hang up') {
          resmsg = ResMsg(2);
        }
        loggerMerchant('error', e.message, '[PaymentDetails requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      } else {
        loggerMerchant(logLevel(b.ResponseCode), b.ResponseMessage, '[PaymentDetails requestCB]');
        return res.json(ResJson(b.ResponseCode, b.ResponseMessage));
      }
    }
    post(optionsWithAuth(reqOptions('payment_details', { body }), getToken(req).token), paymentDetailsRequestCallback);
  }
}


export default PaymentDetailsController;
