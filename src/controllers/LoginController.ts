import { Request, Response } from 'express';
import { LoginResponse } from '../helpers/Response';
import { LoginBody } from './../helpers/RequestBody';
import { post, RequestCallback } from 'request';
import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import { reqOptions } from '../helpers/Functions';
//import loggerMerchant from '../helpers/logger';


function Login(req: Request, res: Response): void {


  const { email, password }: LoginBody = req.body

  if (!email || !password) {
    //loggerMerchant('error', 'Required Parameter is Missing', '[Login]');
    res.json(ResJson(463, ResMsg(23))).end();
    return;
  } else if (!email) {
    res.json(ResJson(463, ResMsg(24))).end();
  } else if (!password) {
    res.json(ResJson(463, ResMsg(25))).end();
  } else {




    const loginRequestCallback: RequestCallback = (e: Error, r, { ResponseCode, ResponseMessage, merchant_details }: LoginResponse) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message = 'socket hang up') {
          resmsg = ResMsg(2);
        }
        //loggerMerchant('error', e.message, '[Login requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      }
      //loggerMerchant(logLevel(ResponseCode), ResponseMessage, '[Login requestCB]');
      switch (ResponseCode) {
        case 401:
          res.json(ResJson(401, ResponseMessage)).end();
          break;
        case 400:
          res.json(ResJson(400, ResponseMessage)).end();
          break;
        case 200:
          let md = merchant_details;
          let merchantDetails = {
            ...md,
            email,
            current_password: password,
            zipcode: md.zipcode
          }
          res.json({
            ResponseCode: 200,
            ResponseMessage: ResMsg(200), merchant_details: merchantDetails
          }).end();
          break;
        case 500:
          res.json(ResJson(500, ResMsg(2))).end();
          break;
        default:
          res.json(ResJson(500, ResMsg(2))).end();
          break;
      }
    }

    post(reqOptions('login', { body: { ...req.body } }), loginRequestCallback);


    // res.json({
    //   ResponseCode: 200,
    //   ResponseMessage: 'Success',
    //   merchant_details: {
    //     merchant_id: 201823122,
    //     seller_name: `Mark`,
    //     shop_name: `Macky's Shop`,
    //     email: `mac21macky@gmail.com`,
    //     city: `Cebu`,
    //     zipcode: 6000,
    //     country: `Philippines`,
    //     contact_number: '09667404625',
    //     store_description: `PinakaMazarap na Store`,
    //     password: `Secreto`,
    //     store_address: `Cebu City`,
    //     store_details: ``,
    //     store_policies: ``,
    //     products: 50,
    //     orders: 340,
    //     current_password: `Secreto`,
    //     sysmodified: new Date()
    //   }
    // }).end();
  }
}

export default Login;