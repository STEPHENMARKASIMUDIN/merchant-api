import Respmsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { waterfall } from 'async';
import { Response, Request } from 'express';
import { ensureDir, pathExists, readdir } from 'fs-extra';
import { T, R, AsyncResultCallback, getFilesFromFTPServer, removeDir, checkFtpFolder, saveImagePath, pathToLocalImages, isEmpty, forEach } from '../helpers/Functions';


const GetProfileImagesPathsController = (req: Request, res: Response) => {
  const shopName: string = req.query.shopName;
  if (!shopName) {
    return res.json(ResJson(463, Respmsg(16))).end();
  } else {



    const pathToLocalDir = pathToLocalImages(shopName, 'profile');

    let bannerPath = '/static/media/defaults/default_banner.jpg',
      profilePath = '/static/media/defaults/default_profile.jpg';
    const saveImagesPath = saveImagePath(shopName, 'profile');
    const pathExistsCB = (e: Error, exists: boolean) => {
      if (e) {
        loggerMerchant('error', e.message, '[GetProfileImagesPath pathExistsCB err]');
        return res.json(ResJson(500, Respmsg(0), { bannerPath, profilePath })).end()
      } else {
        if (exists) {
          readdir(saveImagesPath, readdirCB)
        } else {
          getFiles(saveImagesPath, shopName);
        }
      }
    };
    const readdirCB = (e: Error, files: string[]) => {
      if (e) {
        loggerMerchant('error', e.message, '[GetProfileImagesPath readdirCB err]');
        return res.json(ResJson(500, Respmsg(0), { bannerPath, profilePath })).end()
      } else {
        if (isEmpty(files)) {
          // kung walay nakita na files sa ftp server ilabay and default images
          getFiles(saveImagesPath, shopName);
          //return res.json(ResJson(200, Respmsg(200), { bannerPath, profilePath })).end()
        } else {
          // kung naay nakita na files sa ftp server e update ang default images
          updateFiles(files);
          //send 
          return res.json(ResJson(200, Respmsg(200), { bannerPath, profilePath }))
        }
      }
    }
    var getFiles = (saveImagesPath: string, shopName: string) => {
      const tasks: Function[] = [
        (cb: AsyncResultCallback<T, R, Error>) => {
          //check ftp folder 
          return checkFtpFolder(`/${shopName}/profile`, cb);
        },
        (files: string[], cb: AsyncResultCallback<T, R, Error>) => {
          //create local directory for files if ftp server has files
          if (isEmpty(files)) {
            return cb(new Error('No Files Found.'))
          } else {
            const ensureDirCB = (err: Error) => {
              if (err) {
                return cb(err, 'GetProfileImagesPath ensureDirCB tasks1 err');
              } else {
                loggerMerchant('info', `Directory Created Successfully.`, '[GetProfileImagesPath tasks1]');
                cb(null, true);
              }
            };
            ensureDir(saveImagesPath, ensureDirCB)
          }
        },
        (isDone: boolean, cb: AsyncResultCallback<T, R, Error>) => {
          if (isDone) {
            getFilesFromFTPServer(`${shopName}/profile`, saveImagesPath, 'GetProfileImagesPath tasks2', cb);
          }
        }
      ];
      const waterfallMasterCB = (e: Error, results: any[]) => {
        if (e) {
          loggerMerchant('error', e.message, `[GetProfileImagesPath waterfallMasterCB()]`);
          return res.json(ResJson(500, Respmsg(0), { bannerPath, profilePath })).end()
        } else {
          if (!results.length) {
            // kung walay nakita na files sa ftp server ilabay and default images
            removeDir(saveImagesPath, 'GetProfileImagesPath waterfallMasterCB()', true);
          } else {
            // kung naay nakita na files sa ftp server e update ang default images
            updateFiles(results);
          }
          return res.json(ResJson(200, Respmsg(200), { bannerPath, profilePath })).end()

        }
      }
      waterfall(tasks, waterfallMasterCB);
    }
    const timeStamp = new Date().getTime();
    const updateFiles = (files) => {
      forEach(files, (file, i) => {
        if (file.includes(`${shopName}_profile_banner`)) {
          bannerPath = `${pathToLocalDir}${file}?${timeStamp}`;
        } else if (file.includes(`${shopName}_profile_image`)) {
          profilePath = `${pathToLocalDir}${file}?${timeStamp}`;
        }
      })
    }
    pathExists(saveImagesPath, pathExistsCB)
  }


};


export default GetProfileImagesPathsController;