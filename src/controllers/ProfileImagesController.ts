import { Request, Response } from 'express';
import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { waterfall } from 'async';
import { ErrorCallback } from 'async';
import { getFilesFromFTPServer, saveImagePath } from '../helpers/Functions';


function ProfileImages(req: Request, res: Response) {
  const defaultProfileImagePath = '/path/to/default/profile/image';
  const defaultProfileBannner = '/path/to/default/profile/banner';

  const { shopName } = req.body;
  if (!shopName) {
    return res.json(ResJson(463, ResMsg(16))).end();
  }
  const savePath = saveImagePath(shopName, 'profile');
  const funcs: Function[] = [
    (cb: ErrorCallback) => {
      getFilesFromFTPServer(`/${shopName}/profile`, savePath, `Profile Images`, cb);
    }
  ];

  const waterfallMasterCB = (e: Error, results) => {
    if (e) {
      loggerMerchant('error', e.message, '[ProfileImages waterfallMasterCB]');
      return res.json(ResJson(500, ResMsg(500))).end();
    } else {
      return res.json(ResJson(200, ResMsg(200), results)).end();
    }
  }


  waterfall(funcs, waterfallMasterCB);





}


export default ProfileImages;




