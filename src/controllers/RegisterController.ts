import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { waterfall, AsyncResultCallback } from 'async';
import { RegisterBody } from '../helpers/RequestBody';
import { MLShopAPIResponse } from '../helpers/Response';
import { post, RequestCallback } from 'request';
import { Request, Response } from 'express';
import { removeDir, logLevel, saveFilesToFTP, deleteDirFTP, reqOptions, T } from '../helpers/Functions';
//import { registerFiles } from '../mlshopmerchant';


function Register(req: Request, res: Response) {

  const { seller_name, shop_name, email, password, store_address, city, zipcode, country,
    contact_number, store_description }: RegisterBody = req.body;

  if (Object.keys(req.body).length === 0) {
    loggerMerchant('error', `Required Parameter is Missing.`, `[Register]`);
    return res.json(ResJson(463, ResMsg(16))).end();
  }
  const areParametersNotProvided = (
    !seller_name.trim() || !shop_name.trim() || !email.trim() || !password.trim() || !store_address.trim() || !city.trim()
    || !zipcode || !country.trim() || !contact_number || !store_description.trim()
  );

  if (areParametersNotProvided) {
    loggerMerchant('error', `Required Parameter is Missing.`, `[Register]`);
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const files = req.files;
    const filePaths = Object.keys(req.files).map(o => ({ filePath: files[o][0].path }));


    const funcs: Function[] = [
      (cb: AsyncResultCallback<T, Error>) => {
        if (filePaths.length) {
          saveFilesToFTP({
            parentCallback: cb,
            filePaths,
            isProduct: false,
            messageOccurred: 'Register',
            saveDirectoryPath: 'permits',
            shopName: shop_name,
          })
        } else {
          return cb(null, []);
        }
      },
      (result, cb) => {
        const registerRequestCallback: RequestCallback =
          (e, r, b: MLShopAPIResponse) => e ? cb(e) : cb(null, b);
        post(reqOptions('register', { body: { ...req.body } }), registerRequestCallback);
      }
    ]

    waterfall(funcs, (e, r: MLShopAPIResponse) => {
      removeDir(`${shop_name}/permits`, 'Register waterfallMasterCB');
      if (e) {
        deleteDirFTP(`/${shop_name}/permits`, `Register`);
        loggerMerchant('error', e.message, `[RegisterRequestCB err]`);
        return res.json(ResJson(500, ResMsg(500))).end();
      } else {
        loggerMerchant(logLevel(r.ResponseCode), r.ResponseMessage, `[RegisterRequestCB]`);
        switch (r.ResponseCode) {
          case 200:
            return res.json(ResJson(200, ResMsg(27))).end();
          default:
            deleteDirFTP(`/${shop_name}/permits`, `Register`);
            return res.json(ResJson(r.ResponseCode, r.ResponseMessage)).end();
        }
      }
    })
  }

}


export default Register;