import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { Request, Response } from 'express';
import { get, RequestCallback } from 'request';
import { DashboardTotalSaleBody } from '../helpers/RequestBody';
import { reqOptions, getToken, optionsWithAuth } from '../helpers/Functions';


function DashboardController(req: Request, res: Response): Response {

  const { shopName, from, to }: DashboardTotalSaleBody = req.body
  const areParametersNotProvided = (!shopName || !from || !to)
  if (areParametersNotProvided) {
    loggerMerchant('error', 'Required Parameter is Missing.', '[DashboardTotalSale]');
    return res.json(ResJson(463, ResMsg(16)));
  }
  const dashboardRequestCallback: RequestCallback = (e: Error, r, b) => {
    if (e) {
      let resmsg = ResMsg(0);
      if (e.message = 'socket hang up') {
        resmsg = ResMsg(2);
      }
      return res.json(ResJson(500, resmsg)).end();
    } else {
      res.json(JSON.parse(b)).end();
    }
  }
  get(optionsWithAuth(reqOptions('total_sale', {
    qs: {
      vendor: shopName,
      date_from: from,
      date_to: to
    }
  }, false), getToken(req).token), dashboardRequestCallback)



}

export default DashboardController;
