import RespMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { MLShopAPIResponse } from './../helpers/Response';
import { Request, Response } from 'express';
import { optionsWithAuth, getToken } from '../helpers/Functions';
import { get, RequestCallback, Options, Response as RequestResponse } from 'request';



const GetUserDetailsController = (req: Request, res: Response) => {
  const opts: Options = optionsWithAuth({ url: `${process.env.URL}get_user_details`, json: true }, getToken(req).token);

  const getUserDetailsRequestCallback: RequestCallback = (e: Error, r: RequestResponse, b: MLShopAPIResponse) => {
    if (e) {
      let resmsg = RespMsg(0);
      if (e.message == 'socket hang up') {
        resmsg = RespMsg(2);
      }
      loggerMerchant('error', e.message, `[GetUserDetails requestCB err]`);
      return res.json(ResJson(500, resmsg)).end();
    } else {
      loggerMerchant('info', b.ResponseMessage, `[GetUserDetails requestCB]`);
      return res.json(b).end();
    }
  }

  get(opts, getUserDetailsRequestCallback);
};


export default GetUserDetailsController;