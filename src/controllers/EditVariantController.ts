import ResJson from '../helpers/responseJson';
import ResMsg from '../helpers/responseMessage';
import loggerMerchant from '../helpers/logger';
import { EditVariantBody } from './../helpers/RequestBody';
import { MLShopAPIResponse } from '../helpers/Response';
import { Request, Response } from 'express';
import { RequestCallback, post } from 'request';
import { reqOptions, isNullOrUndefined, getToken, optionsWithAuth } from '../helpers/Functions';

function EditVariantController(req: Request, res: Response) {

  const { barcode, compare_at_price, price,
    product_id, quantity, requires_shipping,
    sku, taxable, variant_id, weight, variant_title }: EditVariantBody = req.body;
  const areParametersNotProvided = (
    isNullOrUndefined(barcode) || isNullOrUndefined(compare_at_price) || isNullOrUndefined(price) ||
    isNullOrUndefined(product_id) || isNullOrUndefined(quantity) || isNullOrUndefined(requires_shipping) || isNullOrUndefined(sku) ||
    isNullOrUndefined(taxable) || isNullOrUndefined(variant_id) || isNullOrUndefined(weight) || isNullOrUndefined(variant_title)
  );



  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are missing.', '[EditVariant]');
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    const editVariantRequestCallback: RequestCallback = (e: Error, r, { ResponseCode, ResponseMessage }: MLShopAPIResponse) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message == 'socket hang up') {
          resmsg = ResMsg(2);
        }
        loggerMerchant('error', e.message, '[EditVariant requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      } else {
        return res.json(ResJson(ResponseCode, ResponseMessage));
      }
    }

    post(optionsWithAuth(reqOptions('edit_variant', { body: { ...req.body, require_shipping: requires_shipping } }), getToken(req).token), editVariantRequestCallback);
  }
}

export default EditVariantController;