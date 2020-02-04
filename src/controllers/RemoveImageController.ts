import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { join } from 'path';
import { unlink, stat } from 'fs-extra';
import { RemoveImageBody } from './../helpers/RequestBody';
import { OptsDeleteFileFTP } from '../helpers/Types';
import { Response, Request } from 'express';
import { MLShopAPIResponse } from './../helpers/Response';
import { RequestCallback, post } from 'request';
import { waterfall, AsyncResultArrayCallback, AsyncBooleanResultCallback } from 'async';
import { reqOptions, T, MLShopFTP, deleteFileFTP, saveImagePath, isFalsy, getToken, optionsWithAuth } from '../helpers/Functions';

function RemoveImage(req: Request, res: Response): any {

  const { image, product_id, image_id, shopName }: RemoveImageBody = req.body;
  const areAllParametersNotProvided = (
    isFalsy(image_id) || isFalsy(image) || isFalsy(product_id)
  )
  const t = getToken(req);
  if (areAllParametersNotProvided) {
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const tasks: Function[] = [
      (cb: AsyncBooleanResultCallback<Error>) => {
        //request to api to delete image
        const opts = reqOptions('remove_image', { body: { product_id, image_id } });
        const RemoveImageRequestCallback: RequestCallback = (e, r, { ResponseCode, ResponseMessage }: MLShopAPIResponse) => {
          if (e) {
            let resmsg = ResMsg(0);
            if (e.message = 'socket hang up') {
              resmsg = ResMsg(2);
            }
            loggerMerchant('error', e.message, '[RemoveImage task1 requestCB err]');
            return res.json(ResJson(500, resmsg)).end();
          } else {
            switch (ResponseCode) {
              case 200:
                return cb(null, true);
              default:
                const e = new Error(ResponseMessage);
                e['code'] = ResponseCode;
                return cb(e);
            }
          }
        }
        post(optionsWithAuth(opts, t.token), RemoveImageRequestCallback);
      },
      (isSuccess: boolean, cb: AsyncResultArrayCallback<T, Error>) => {
        //delete image from ftp server  
        const ftpInstance = MLShopFTP();
        if (isSuccess) {
          ftpInstance.on('ready', () => {
            const optsFtp: OptsDeleteFileFTP = {
              callback: cb,
              closeCon: true,
              ftp: ftpInstance,
              filePath: `${shopName}/product/${image}`,
              messageOccurred: 'RemoveImage task2',
            }
            deleteFileFTP(optsFtp);
          });
          ftpInstance.on('error', (e: Error) => {
            return cb(e);
          });

        }
      },
      (fileName: string, cb: AsyncBooleanResultCallback<Error>) => {
        //delete the image in the local path
        let filePath = `${join(saveImagePath(shopName, 'product'), image)}`;
        stat(filePath, (e, fileInfo) => {
          if (e) {
            return (e.code === 'ENOENT' || e.code === 'EPERM') ? cb(null, true) : cb(e);
          } else {
            if (fileInfo.isFile()) {
              unlink(filePath, (e) => {
                if (e) {
                  loggerMerchant('error', e.message, '[RemoveImage task3 unlinkCB]');
                  return cb(e);
                } else {
                  return cb(null, true);
                }
              })
            } else {
              return cb(null, true);
            }
          }
        })

      }
    ];
    const removeImageWaterfallMasterCB: AsyncBooleanResultCallback<Error> = (e, areAllTasksDone) => {
      if (e) {
        loggerMerchant('error', e.message, '[RemoveImage waterfallMasterCB]');
        return res.json(ResJson(500, ResMsg(0))).end();
      } else {
        return res.json(ResJson(200, ResMsg(30))).end();
      }
    }
    waterfall(tasks, removeImageWaterfallMasterCB)
  }

}

export default RemoveImage;