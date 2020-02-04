import resJson from "../helpers/responseJson";
import Respmsg from "../helpers/responseMessage";
import loggerMerchant from '../helpers/logger';
import { Request, Response } from 'express';
import { MLShopAPIResponse } from './../helpers/Response';
import { ChangePasswordBody } from '../helpers/RequestBody';
import { post, RequestCallback } from 'request';
import { reqOptions, logLevel, isNullOrUndefined, getToken, optionsWithAuth } from '../helpers/Functions';


function ChangePassword(req: Request, res: Response) {

  const { old_password, new_password }: ChangePasswordBody = req.body;

  const areParametersNotProvided = (isNullOrUndefined(old_password) || isNullOrUndefined(new_password));
  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is Missing.', '[ChangePassword]');
    return res.json(resJson(463, Respmsg(16))).end();
  } else {
    const changePasswordRequestCallback:
      RequestCallback = (e: Error, r, { ResponseCode, ResponseMessage }: MLShopAPIResponse) => {
        if (e) {
          let resmsg = Respmsg(0);
          if (e.message === 'socket hang up') {
            resmsg = Respmsg(2);
          }
          loggerMerchant('error', e.message, '[ChangePassword requestCB err]');
          return res.json(resJson(500, resmsg)).end();
        } else {
          loggerMerchant(logLevel(ResponseCode), ResponseMessage, '[ChangePassword requestCB]');
          return res.json(resJson(ResponseCode, ResponseMessage)).end();
        }
      }

    post(optionsWithAuth(reqOptions('change_password', { body: { ...req.body }, }), getToken(req).token), changePasswordRequestCallback);
  }

}



export default ChangePassword;
