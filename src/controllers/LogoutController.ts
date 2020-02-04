import Respmsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { join } from 'path';
import { stat } from 'fs-extra';
import { parallel } from 'async';
import { Request, Response } from 'express';
import { MLShopAPIResponse } from '../helpers/Response';
import { removeDir, saveImagePath } from '../helpers/Functions';
import { get, Options, Response as RequestResponse } from 'request';



const statPath = (path: string, cb: Function) => {
  stat(path, (e, info) => {
    if (e) {
      loggerMerchant('error', e.message, '[Logout]');
      cb(null);
    }
    else if (info.isDirectory()) {
      removeDir(path, 'Logout', true);
      cb(null);
    }
  });
}


const LogoutController = (req: Request, res: Response): void => {

  const { shopName } = req.body;
  const pathToLocalDir = join(__dirname, '../build/static/media', `/${shopName}`);
  const productsPath = saveImagePath(shopName, 'product');
  const profilePath = saveImagePath(shopName, 'profile');

  const statFuncs = [(cb: Function) => statPath(productsPath, cb), (cb: Function) => statPath(profilePath, cb)];
  parallel(statFuncs, (err: Error) => {
    if (err) {
      loggerMerchant('error', err.message, '[LogoutController parallel err]');
      return res.json(ResJson(200, 'Success')).end();
    }
    const opts: Options = {
      url: `${process.env.URL}logout`,
      headers: {
        'Authorization': req.headers.authorization
      },
      callback: (err: Error, r: RequestResponse, b: MLShopAPIResponse) => {
        if (err) {
          loggerMerchant('error', err.message, '[LogoutController request err cb]');
          return res.json(ResJson(500, Respmsg(0))).end();
        } else {
          loggerMerchant('info', b.ResponseMessage, '[LogoutController request cb]');
          return res.json(ResJson(200, Respmsg(200))).end();
        }
      }
    }
    get(opts)
  })


}


export default LogoutController;