import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import logger from '../helpers/logger';
import { QuerySalesReport } from '../helpers/RequestQuery';
import { Response, Request } from 'express';
import { ProductInventoryResponse } from '../helpers/Response';
import { get, RequestCallback, Options } from 'request';
import { reqOptions, logLevel, getToken, optionsWithAuth } from '../helpers/Functions';

function ProductInventory(req: Request, res: Response) {

  const { date, month, range, vendor, year }: QuerySalesReport = req.query;
  const areRequiredParametersNotProvided = (!vendor || !range);
  if (areRequiredParametersNotProvided || !['DAILY', 'MONTHLY'].includes(range)) {
    logger('error', ResMsg(16), '[ProductInventory]');
    return res.json(ResJson(463, ResMsg(16))).end();
  } else {
    var opts: Options;
    switch (range) {
      case 'DAILY':
        opts = reqOptions('product_inventory', {
          qs: {
            date,
            range,
            vendor
          }
        }, false);
        break;
      default:
        opts = reqOptions('product_inventory', {
          qs: {
            year,
            month,
            range,
            vendor
          }
        }, false);
        break;
    }
    const ProductInventoryRequestCallback: RequestCallback = (e: Error, r, b) => {
      if (e) {
        let resmsg = ResMsg(0);
        if (e.message = 'socket hang up') {
          resmsg = ResMsg(2);
        }
        logger('error', e.message, '[ProductInventory requestCB err]');
        return res.json(ResJson(500, resmsg)).end();
      } else {
        console.log(opts);
        const { ResponseCode, ResponseMessage, product_reports }: ProductInventoryResponse = JSON.parse(b)
        logger(logLevel(ResponseCode), ResponseMessage, '[ProductInventory requestCB]');
        switch (ResponseCode) {
          case 200:
            return res.json(ResJson(200, ResponseMessage, product_reports)).end();
          default:
            return res.json(ResJson(ResponseCode, ResponseCode === 404 ? 'No Data Found.' : ResponseMessage)).end();
        }
      }
    }
    get(optionsWithAuth(opts, getToken(req).token), ProductInventoryRequestCallback);

  }
}


export default ProductInventory;