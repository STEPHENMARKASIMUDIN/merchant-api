import ResJson from '../helpers/responseJson';
import Respmsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import { MLShopAPIResponse } from '../helpers/Response'
import { ResetPasswordBody } from '../helpers/RequestBody';
import { Request, Response } from 'express';
import { get, RequestCallback } from 'request';
import { reqOptions, isFalsy } from '../helpers/Functions';

function ResetPassword(req: Request, res: Response) {

  const { contact_number, email }: ResetPasswordBody = req.body;

  const areParametersNotProvided = (isFalsy(contact_number) || isFalsy(email));

  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is Missing.', '[ResetPassword]');
    return res.json(ResJson(463, Respmsg(16))).end();
  } else {
    const resetPasswordRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let resmsg = Respmsg(0);
        if (e.message = 'socket hang up') {
          resmsg = Respmsg(2);
        }
        loggerMerchant('error', e.message, '[ResetPassword err]');
        return res.json(ResJson(500, resmsg)).end();

      } else {
        const { ResponseCode, ResponseMessage }: MLShopAPIResponse = JSON.parse(b);
        return res.json(ResJson(ResponseCode, ResponseMessage));
      }
    }

    get(reqOptions('reset_password', {
      qs: {
        email,
        contact_number
      }
    }, false), resetPasswordRequestCallback);
  }


}


export default ResetPassword;