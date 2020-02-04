import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';
import loggerMerchant from '../helpers/logger';
import { resultMasterCB } from '../helpers/Types';
import { join, basename } from 'path';
import { ChangeImagesBody } from '../helpers/RequestBody';
import { MLShopAPIResponse } from '../helpers/Response';
import { Response, Request } from 'express';
import { post, RequestCallback } from 'request';
import { waterfall, AsyncResultCallback } from 'async';
import { ReadStream, createWriteStream, stat, Stats } from 'fs-extra';
import { reqOptions, removeDir, T, MLShopFTP, fileExtension, splitString, deleteFileFTP, createDirs, saveImagePath, deleteFile, isNullOrUndefined, getToken, optionsWithAuth } from '../helpers/Functions';

const ChangeImagesController = (req: Request, res: Response) => {


  const { email, shop_name, currentPathToFile, inputName }: ChangeImagesBody = req.body;

  let api: string = '', filePath: string = '', messageOccurred: string = 'ChangeImages';
  const areParemetersNotProvided = (isNullOrUndefined(email) || isNullOrUndefined(shop_name));

  if (areParemetersNotProvided) {
    loggerMerchant('error', 'Required Parameter is/are Missing.', `[${messageOccurred}]`);
    return res.json(ResJson(463, ResMsg(16)));
  }


  let b = { shop_name, email };
  let body: any;
  const file = req.files[inputName][0];


  const { ext, filename } = fileExtension(file.filename);
  const oldFileName = splitString(basename(currentPathToFile), "?");
  const newFileName = `${shop_name}_${filename}.${ext}`;
  const pathToLocalDir = saveImagePath(shop_name, 'profile');
  switch (inputName) {
    case 'profile_image':
      api = 'profile_image';
      filePath = file.path;
      body = { ...b, profile_image: newFileName }
      break;
    default:
      api = 'profile_banner'
      filePath = file.path;
      body = { ...b, profile_banner: newFileName }
      break;
  }

  const opts = reqOptions(api, { body });

  const ftpInstance = MLShopFTP();

  ftpInstance.on('ready', () => {
    const tasks: Function[] = [
      (cb: AsyncResultCallback<T, Error>) => {
        //Make Profile Directory to the Ftp Server for the Specific Shop Name
        messageOccurred = 'ChangeImages task1';
        ftpInstance.mkdir(`/${shop_name}/profile`, true, (e) => {
          if (e) {
            return cb(e, messageOccurred);
          } else {
            cb(null);
          }
        })
      },
      (cb: AsyncResultCallback<T, Error>) => {
        //Delete the current Image from the FTP Server if it's not a default image
        messageOccurred = 'ChangeImages task2';
        const isCurrentFileADefault = (oldFileName == 'default_banner.jpg'
          || oldFileName == 'default_profile.png');
        if (isCurrentFileADefault) {
          return cb(null, oldFileName);
        } else {
          const opts = {
            ftp: ftpInstance,
            filePath: `/${shop_name}/profile/${oldFileName}`,
            messageOccurred,
            callback: cb
          }
          deleteFileFTP(opts)
        }

      },
      (oldFileName: string, cb: AsyncResultCallback<T, Error>) => {
        //Put the Local File to the FTP Server
        messageOccurred = 'ChangeImages task3';
        ftpInstance.put(filePath, `/${shop_name}/profile/${newFileName}`, (e) => {
          if (e) {
            return cb(e, messageOccurred);
          } else {
            cb(null);
          }
        })
      },
      (cb: AsyncResultCallback<T, Error>) => {
        //request to update profile to database
        messageOccurred = 'ChangeImages task4';
        const changeImagesRequestCallback: RequestCallback = (e: Error, r, b: MLShopAPIResponse) => {
          if (e) {
            loggerMerchant('error', e.message, '[ChangeImages task4 changeImagesRequestCB]');
            return cb(e, `${messageOccurred} changeImagesRequestCB err`);
          } else {
            stat(filePath, (e: Error, stats: Stats) => {
              if (e) {
                return cb(e, `${messageOccurred} unlink err`);
              } else {
                if (stats.isFile()) {
                  switch (b.ResponseCode) {
                    case 200:
                      return deleteFile(filePath, 'ChangeImages', cb);
                    default:
                      const opts = { ftp: ftpInstance, filePath: `/${shop_name}/profile/${newFileName}`, messageOccurred, callback: cb }
                      deleteFileFTP(opts);
                  }
                } else {
                  return cb(null);
                }
              }
            })
          }
        }
        post(optionsWithAuth(opts, getToken(req).token), changeImagesRequestCallback);
      },
      (fileName: string, cb: AsyncResultCallback<T, Error>) => {
        // create local directory for file if does not exists
        messageOccurred = 'ChangeImages task5';
        createDirs(pathToLocalDir, false, cb);
      },
      (cb: AsyncResultCallback<T, Error>) => {
        // save file to local directory created
        messageOccurred = 'ChangeImages task6';
        const filePath = createWriteStream(join(pathToLocalDir, `${newFileName}`));
        ftpInstance.get(`/${shop_name}/profile/${newFileName}`, (e, stream: ReadStream) => {
          if (e) {
            return cb(e, `${messageOccurred} ftp.get err`);
          } else {
            stream.pipe(filePath);
            stream.on('end', () => {
              return cb(null,
                {
                  messageOccurred,
                  newPath: `/static/media/${shop_name}/profile/${newFileName}`
                });
            });
          }
        })
      }
    ]

    const waterfallMasterCB = (e: Error, result: resultMasterCB | string) => {
      const fullPathToTempDir = join(__dirname, '../../merchant-uploads', `${shop_name}`)
      removeDir(fullPathToTempDir, 'ChangeImages waterfallMasterCB', true);
      if (e) {
        loggerMerchant('error', e.message, `[${result} waterfallMasterCB]`);
        return res.json(ResJson(500, ResMsg(0))).end();
      } else {
        const { messageOccurred, newPath } = <resultMasterCB>result;
        const timeStamp = new Date().getTime();
        return res.json(ResJson(200, ResMsg(200), {
          newPath: `${newPath}?${timeStamp}`
        })).end();
      }
    }

    waterfall(tasks, waterfallMasterCB);
  });


  ftpInstance.on('error', (e: Error) => {
    loggerMerchant('error', e.message, '[ChangeImages ftpInstance]');
    return res.json(ResJson(500, ResMsg(0))).end();
  })








};


export default ChangeImagesController;


