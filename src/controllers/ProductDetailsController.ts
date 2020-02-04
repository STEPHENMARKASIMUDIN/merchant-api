import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { waterfall } from 'async';
import { Request, Response } from 'express';
import { get, RequestCallback } from 'request';
import { QueryStringProductDetails } from '../helpers/RequestQuery';
import { ProductDetailsResponse, ProductDetailsImages } from '../helpers/Response';
import { logLevel, reqOptions, isFalsy, pathToLocalImages, getStaticFileName, AsyncResultCallback, T, checkLocalDir, saveImagePath, getFilesFromFTPServer, R, deleteFiles, getToken, optionsWithAuth } from '../helpers/Functions';


function ProductDetails(req: Request, res: Response): any {

  const { product_number, vendor }: QueryStringProductDetails = req.query
  const areParametersNotProvided = (isFalsy(product_number) || isFalsy(vendor))
  let messageOccurred = 'Parameter/s is Missing.';
  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are Missing', `[ProductDetails ${messageOccurred}]`);
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const productDetailsRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message = 'socket hang up') {
          resmsg = ResMsg(2);
        }
        loggerMerchant('error', e.message, '[ProductDetails requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      } else {
        messageOccurred = 'requestCB'
        loggerMerchant(logLevel(b.ResponseCode), b.ResponseMessage, `[ProductDetails ${messageOccurred}]`);
        const { Product_Details, Product_Variant }: ProductDetailsResponse = JSON.parse(b);
        const pathToProductImages: string = pathToLocalImages(vendor, 'product');
        const noImage: string = getStaticFileName('no_image')[0];
        let imagePath: string = "";
        let imagesDetails = Product_Details.images.map((image, i): ProductDetailsImages => {
          const timeStamp = new Date().getTime();
          if (image.includes('NaN')) {
            imagePath = `/static/media/${noImage}`;
          } else {
            imagePath = `${pathToProductImages}${image}?${timeStamp}`
          }
          return {
            id: Product_Details.image_id[i],
            imagePath,
            image
          }
        });
        const saveProductImagesPath = saveImagePath(vendor, 'product');
        // Download all the missing files from the ftp server
        const tasks: Function[] = [
          (cb: AsyncResultCallback<T, Error>) => {
            //get all the missing files
            messageOccurred = "ProductDetails Filter the missing Files."
            checkLocalDir(saveProductImagesPath, Product_Details.images, cb);
          },
          (missingFiles: string[], cb: AsyncResultCallback<T, R, Error>) => {
            //download all the missing files from ftp server
            messageOccurred = "ProductDetails Download the missing Files."
            getFilesFromFTPServer(`${vendor}/product`, saveProductImagesPath, `${messageOccurred}`, cb, missingFiles);
          },
          (files: string[], cb: AsyncResultCallback<T, Error>) => {
            //delete all files with a files size of 0
            messageOccurred = "ProductDetails Delete All Files with File Size of 0."
            deleteFiles(saveProductImagesPath, `${messageOccurred}`, cb);
          }
        ];


        waterfall(tasks, (e, result) => {
          if (e) {
            loggerMerchant('error', e.message, `[${messageOccurred} waterfallMasterCB]`);
            return res.json(ResJson(500, ResMsg(0))).end();
          } else {
            Product_Details.imagesDetails = imagesDetails;
            return res.json(ResJson(200, ResMsg(200), { Product_Details, Product_Variant })).end();
          }
        })



      }
    }

    get(optionsWithAuth(reqOptions('product_details', { qs: { ...req.query } }, false), getToken(req).token), productDetailsRequestCallback);


  }

}



export default ProductDetails;