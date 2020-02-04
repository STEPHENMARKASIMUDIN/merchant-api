import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger'
import { ProductsResponse } from '../helpers/Response';
import { Request, Response } from 'express';
import { QueryStringProducts } from './../helpers/RequestQuery';
import { get, RequestCallback } from 'request';
import { waterfall, AsyncResultCallback } from 'async';
import { reqOptions, logLevel, T, getProductImages, getToken, optionsWithAuth } from '../helpers/Functions';


function ProductsController(req: Request, res: Response) {

  const { shopName, from, to }: QueryStringProducts = req.query;
  const areAllParametersNotProvided = (!shopName || !from || !to)
  if (areAllParametersNotProvided) {
    loggerMerchant('error', `Required Parameter is/are Missing.`, '[Products]');
    return res.json(ResJson(463, ResMsg(16)));
  } else {
    const ProductsRequestCallback: RequestCallback = (e: Error, r,
      b: string) => {
      if (e) {
        let remsg = ResMsg(0);
        if (e.message == 'socket hang up') {
          remsg = ResMsg(2);
        }
        loggerMerchant('error', e.message, '[Products requestCB err]');
        res.json(ResJson(500, remsg)).end();
        return;
      } else {
        const parse: ProductsResponse = JSON.parse(b);
        loggerMerchant(logLevel(parse.ResponseCode), `${parse.ResponseCode}`, '[Products requestCB]');



        // const saveProductImagesPath = saveImagePath(shopName, 'product');
        // const pathToProductImages = pathToLocalImages(shopName, 'product');
        // const tasks: Function[] = [
        //   (cb: AsyncResultCallback<T, Error>) => {
        //     //check if product list is in response 
        //     const e = new Error(parse.ResponseMessage);
        //     e['code'] = parse.ResponseCode;
        //     e.name = 'No Product List.'
        //     if (!parse.Product_List) {
        //       return cb(e)
        //     } else {
        //       if (!parse.Product_List.length) {
        //         return cb(e);
        //       } else {
        //         //make directory for images;
        //         createDirs(saveProductImagesPath, false, cb);
        //       }
        //     }
        //   },
        //   (cb: AsyncResultCallback<T, Error>) => {
        //     // get the product images from ftp server
        //     let images = parse.Product_List.map(o => o.image);
        //     checkLocalDir(saveProductImagesPath, images, cb);
        //   },
        //   (missingFiles: string[], cb: AsyncResultCallback<T, Error>) => {
        //     if (!missingFiles.length) {
        //       return cb(null, missingFiles);
        //     } else {
        //       getFilesFromFTPServer(`/${shopName}/product`, saveProductImagesPath, 'Products task2', cb, missingFiles);
        //     }
        //   },
        //   (files: string[], cb: AsyncResultCallback<T, Error>) => {
        //     const productImagesPath = saveImagePath(shopName, 'product');
        //     deleteFiles(productImagesPath, 'Products task4', cb);
        //   },
        //   (zeroFiles: string[], cb: AsyncResultCallback<T, Error>) => {
        //     const noImage = getStaticFileName('no_image')[0];
        //     const newProductList = parse.Product_List.map(item => {
        //       const timeStamp = new Date().getTime();
        //       if (zeroFiles.includes(item.image)) {
        //         item.imagePath = `/static/media/${noImage}`;
        //       } else {
        //         item.imagePath = `${pathToProductImages}${item.image}?${timeStamp}`
        //       }
        //       return item;
        //     });
        //     return cb(null, newProductList);
        //   }
        // ];

        const tasks: Function[] = [
          (cb: AsyncResultCallback<T, Error>) => {
            getProductImages({ messageOccurred: 'Products', parentCB: cb, shopName, response: parse })
          }
        ]

        waterfall(tasks, (e, result) => {
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
          }
        });

      }
    }

    const opts = reqOptions('products',
      { qs: { vendor: shopName, limit_from: +from, limit_to: +to } }, false);
    get(optionsWithAuth(opts, getToken(req).token), ProductsRequestCallback);
  }


}




export default ProductsController;