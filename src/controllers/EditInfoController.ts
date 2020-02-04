import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { EditInfoBody } from './../helpers/RequestBody';
import { MLShopAPIResponse } from '../helpers/Response';
import { Response, Request } from 'express';
import { post, RequestCallback } from 'request';
import { reqOptions, logLevel, getToken, optionsWithAuth } from '../helpers/Functions';

function EditInfo(req: Request, res: Response): void {

  const { seller_name, shop_name, store_address, city, country,
    zipcode, contact_number, store_description, store_details, store_policies, email }:
    EditInfoBody = req.body;

  const areParametersNotProvided = (
    !seller_name || !shop_name || !email
  );

  if (areParametersNotProvided) {
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const editInfoRequestCallback: RequestCallback = (e, r, { ResponseCode, ResponseMessage }: MLShopAPIResponse) => {
      if (e) {
        loggerMerchant('error', e.message, '[EditInfo RequestCB]');
        return res.json(ResJson(500, ResMsg(0))).end();
      }
      loggerMerchant(logLevel(ResponseCode), ResponseMessage, '[EditInfo RequestCB]');
      switch (ResponseCode) {
        case 463:
          res.json(ResJson(ResponseCode, `Shop Name must not be Empty!`)).end();
          return;
        case 500:
          res.json(ResJson(ResponseCode, ResMsg(0))).end();
          return;
        case 200:
          res.json(ResJson(ResponseCode, ResMsg(200), req.body)).end();
          return;
        default:
          res.json(ResJson(ResponseCode, ResMsg(0))).end();

      }
    }

    post(optionsWithAuth(reqOptions('my_account', { body: { ...req.body } }), getToken(req).token), editInfoRequestCallback)
  }

}



export default EditInfo;