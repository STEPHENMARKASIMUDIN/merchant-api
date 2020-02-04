import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { stat } from 'fs-extra';
import { join } from 'path';
import { unlink, Stats } from 'fs-extra';
import { OptsDeleteFileFTP } from '../helpers/Types';
import { Request, Response } from 'express';
import { RemoveProductBody } from '../helpers/RequestBody';
import { post, get, RequestCallback } from 'request';
import { MLShopAPIResponse, ProductsResponse } from '../helpers/Response';
import { waterfall, AsyncResultArrayCallback, AsyncBooleanResultCallback } from 'async';
import { reqOptions, MLShopFTP, T, deleteFileFTP, saveImagePath, AsyncResultCallback, getProductImages, logLevel, R, isFalsy, getToken, optionsWithAuth } from '../helpers/Functions';

function RemoveProduct(req: Request, res: Response) {

  const { product_id, shopName, image, from, to }: RemoveProductBody = req.body;
  const t = getToken(req);
  const areParametersNotProvided = (isFalsy(product_id) || isFalsy(shopName));
  if (areParametersNotProvided) {
    loggerMerchant('error', `Required Parameter is Missing.`, `[RemoveProduct]`);
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const opts = reqOptions('remove_products', { body: { vendor: shopName, product_id: [product_id] } });
    const removeProductRequestCallback: RequestCallback = (e: Error, r, b: MLShopAPIResponse) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message = 'socket hang up') {
          resmsg = ResMsg(2);
        }
        loggerMerchant('error', e.message, '[ProductDetails requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      } else {
        switch (b.ResponseCode) {
          case 200:
            let parse: ProductsResponse;
            const tasks: Function[] = [
              (cb: AsyncResultArrayCallback<T, Error>) => {
                //delete the file on the ftp server
                const ftpInstance = MLShopFTP();
                const opts: OptsDeleteFileFTP = {
                  callback: cb,
                  closeCon: true,
                  filePath: `/${shopName}/product/${image}`,
                  ftp: ftpInstance,
                  messageOccurred: 'RemoveProduct task1'
                }
                ftpInstance.on('ready', () => deleteFileFTP(opts));
              },
              (fileName: string, cb: AsyncBooleanResultCallback<Error>) => {
                //delete the file in the local path
                const filePath = `${join(saveImagePath(shopName, 'product'), image)}`;
                stat(filePath, (e, info: Stats) => {
                  if (e) {
                    loggerMerchant('error', e.message, '[RemoveProduct tasks2 unlinkCB err]');
                    if (e.code === 'EPERM') {
                      return cb(null, true);
                    } else {
                      return cb(null, true);
                    }
                  }
                  else if (!info.isFile()) {
                    return cb(null, true);
                  } else {
                    unlink(filePath, (e) => {
                      if (e) {
                        loggerMerchant('error', e.message, '[RemoveProduct tasks2 unlinkCB]');
                        if (e.code === 'EPERM') {
                          return cb(null, true);
                        }
                      }
                      return cb(null, true);
                    })
                  }
                })

              },
              (doneDeletingFile: boolean, cb: AsyncResultCallback<T, R, Error>) => {
                // request for updated products
                if (doneDeletingFile) {
                  const opts = reqOptions('products',
                    { qs: { vendor: shopName, limit_from: +from, limit_to: +to } }, false);
                  const removeProductRequestCallback: RequestCallback = (e: Error, response, b: string) => {
                    if (e) {
                      let remsg = ResMsg(0);
                      if (e.message == 'socket hang up') {
                        remsg = ResMsg(2);
                      }
                      loggerMerchant('error', e.message, '[Products requestCB err]');
                      res.json(ResJson(500, remsg)).end();
                      return;
                    } else {
                      parse = JSON.parse(b);
                      loggerMerchant(logLevel(parse.ResponseCode), `${parse.ResponseCode}`, '[RemoveProduct requestCB]');
                      getProductImages({ messageOccurred: 'RemoveProducts', parentCB: cb, response: parse, shopName });
                    }
                  }
                  get(optionsWithAuth(opts, t.token), removeProductRequestCallback);
                }
              }
            ];
            waterfall(tasks, (e, result: T[]) => {
              if (e) {
                if (e.name === 'No Product List.') {
                  return res.json(ResJson(e['code'], e.message));
                }
                return res.json(ResJson(500, ResMsg(0)));
              } else {
                switch (parse.ResponseCode) {
                  case 200:
                    return res.json(ResJson(parse.ResponseCode, parse.ResponseMessage, result)).end();
                  default:
                    return res.json(ResJson(parse.ResponseCode, parse.ResponseMessage)).end();
                }
              };
            })
            break;
          default:
            return res.json(ResJson(b.ResponseCode, b.ResponseMessage)).end();
        }
      }
    }
    post(optionsWithAuth(opts, t.token), removeProductRequestCallback);
  }
}


export default RemoveProduct;


//product_id
//vendor
//remove_products - url