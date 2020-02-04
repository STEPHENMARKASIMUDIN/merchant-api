import ResJson from '../helpers/responseJson';
import ResMsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import ProductDetails from './ProductDetailsController';
import { MulterFile } from './../helpers/Types';
import { AddImageBody } from './../helpers/RequestBody';
import { Request, Response } from 'express';
import { MLShopAPIResponse } from '../helpers/Response';
import { RequestCallback, post } from 'request';
import { waterfall, AsyncResultCallback } from 'async';
import { T, removeDir, isFalsy, reqOptions, getFilesFromFTPServer, saveImagePath, uploadImageFiles, getToken, optionsWithAuth } from '../helpers/Functions';

function AddImage(req: Request, res: Response) {
  let messageOccurred = 'Add Image';

  loggerMerchant('info', `Calling Add Image Controller`, `[AddImage ${messageOccurred}]`);
  const { shop_name, product_id }: AddImageBody = req.body;

  const areParametersNotProvided = (isFalsy(shop_name) || isFalsy(product_id));
  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are Missing.', '[AddImage]');
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const filesUploaded = <MulterFile[]>req.files;
    const tasks: Function[] = [
      ...uploadImageFiles(filesUploaded, req, messageOccurred, 'product'),
      (fileNames: string[], cb: AsyncResultCallback<T, Error>) => {
        //call api to save the new images to DB.
        messageOccurred = 'Add Image - Saving Files DB.'
        const opts = reqOptions('add_images', {
          body: {
            product_id,
            src: fileNames,
            byte_image: [1]
          }
        });

        const addImagesRequestCallback: RequestCallback = (e, r, b: MLShopAPIResponse) => {
          if (e) {
            let resmsg = ResMsg(0);
            if (e.message = 'socket hang up') {
              resmsg = ResMsg(2);
            }
            return res.json(ResJson(500, resmsg)).end();
          } else {
            loggerMerchant('info', b.ResponseMessage, '[]');
            switch (b.ResponseCode) {
              case 200:
                return cb(null, fileNames);
              default:
                return cb(new Error("Can't Save Images"));
            }
          }
        }
        post(optionsWithAuth(opts, getToken(req).token), addImagesRequestCallback);
      },
      (fileNames: string[], cb: AsyncResultCallback<T, Error>) => {
        messageOccurred = "Add Image - Get The Files from FTP Server."
        const saveImagesPath = saveImagePath(shop_name, 'product');
        //get the uploaded files from ftp server
        getFilesFromFTPServer(`${shop_name}/product`, saveImagesPath, `${messageOccurred}`, cb, fileNames);
      }
    ]
    const waterFallMasterCB: AsyncResultCallback<T, Error> = (e: Error, result: any[]) => {
      removeDir(shop_name, messageOccurred);
      if (e) {
        loggerMerchant('error', e.message, `[${messageOccurred} waterfallMasterCB]`);
        return res.json(ResJson(500, ResMsg(0))).end();
      } else {
        req.query = {
          product_number: product_id,
          vendor: shop_name
        }
        ProductDetails(req, res);
        //res.json(ResJson(200, ResMsg(31))).end();
      }

    }



    waterfall(tasks, waterFallMasterCB);

  }



}


export default AddImage;  