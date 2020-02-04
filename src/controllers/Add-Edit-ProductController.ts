import Respmsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { readFile } from 'fs-extra';
import { join } from 'path';
import { MulterFile } from '../helpers/Types';
import { waterfall, eachOf } from 'async';
import { MLShopAPIResponse } from '../helpers/Response';
import { Request, Response } from 'express';
import { EditProductBody, OptsData } from '../helpers/RequestBody';
import { RequestCallback, post, Options } from 'request';
import { reqOptions, isNullOrUndefined, isFalsy, uploadImageFiles, AsyncResultCallback, T, R, deleteFiles, getToken, optionsWithAuth } from '../helpers/Functions';


function AddEditProductController(req: Request, res: Response) {
  let messageOccurred = 'AddEditProduct';

  const { product_id, barcode, compare_at_price, description,
    price, product_name, product_type, quantity, sku, tags, type, vendor }: EditProductBody = req.body;
  let body: object = {}, additionalConditions: boolean = false, path: string = '';
  const areParametersNotProvided = (
    isFalsy(barcode) || isNullOrUndefined(compare_at_price) || isFalsy(description) || isNullOrUndefined(price) || !product_name
    || isFalsy(product_type) || isNullOrUndefined(quantity) || !tags || isFalsy(vendor)
  );
  switch (type) {
    case 'add_product':
      path = type;
      body = { ...req.body, body_html: description, inventory_quantity: quantity, title: product_name }
      if (body['options'] === 'false') {
        delete body['options'];
        body['options'] = false;
      } else {
        let newArr: any[] = JSON.parse(body['options']);
        newArr = newArr.map((item: OptsData) => ({ option: { ...item } }));
        body['options'] = newArr;
      }
      break;
    case 'edit_product':
      path = 'products', body = { ...req.body, product_number: product_id };
      additionalConditions = isNullOrUndefined(product_id)
      break;
    default:
      return res.json(ResJson(463, Respmsg(16))).end();

  }
  loggerMerchant('info', body, `[Add-Edit-Product ${type}]`)
  if (areParametersNotProvided || additionalConditions) {
    loggerMerchant('error', 'Required Parameter is/are is missing', `[Add-Edit-Product ${type}]`);
    return res.json(ResJson(463, Respmsg(16))).end();
  } else {
    const requestAddEditProduct = (body?: object) => {
      const editProductRequestCallback: RequestCallback = (e: Error, r, b: MLShopAPIResponse) => {
        const fullPathToTempDir = join(__dirname, '../../merchant-uploads', `${req.body['shop_name'] ? req.body['shop_name'] : req.body['vendor']}`);
        deleteFiles(fullPathToTempDir, 'ChangeImages waterfallMasterCB');
        if (e) {
          let resmsg = Respmsg(0);
          if (e.message == 'socket hang up') {
            resmsg = Respmsg(2);
          }
          loggerMerchant('error', e.message, `[Add-Edit-Product ${type} err]`);
          return res.json(ResJson(500, resmsg)).end();
        } else {
          return res.json(ResJson(b.ResponseCode, b.ResponseMessage));
        }
      }
      const opts: Options = optionsWithAuth(reqOptions(path, { body: { ...body } }), getToken(req).token);
      post(opts, editProductRequestCallback);
    }
    switch (type) {
      case 'add_product':
        const filesUploaded = <MulterFile[]>req.files;
        let byteImage: string[] = [], filePath: string = '';
        waterfall([
          (cb: AsyncResultCallback<T, R, Error>) => {
            eachOf(filesUploaded, (fileInfo, i, callB) => {
              //filePath = basename(fileInfo.path);
              readFile(fileInfo.path, (err: NodeJS.ErrnoException, fileData: Buffer) => {
                return err ? callB(err) : (byteImage = [...byteImage, fileData.toString('base64')], callB());
              })
            }, (e) => {
              return e ? cb(e) : cb();
            })
          },
          ...uploadImageFiles(filesUploaded, req, messageOccurred, 'product')
        ], (e: Error, result) => {
          if (e) {
            loggerMerchant('error', e.message, `[${messageOccurred} waterfallMasterCB]`);
            return res.json(ResJson(500, Respmsg(0))).end();
          } else {
            body['src'] = result;
            body['byteImage'] = byteImage;
            requestAddEditProduct(body);
          }
        })
        break;
      default:
        requestAddEditProduct(body);
        break;
    }

  }








}

export default AddEditProductController;