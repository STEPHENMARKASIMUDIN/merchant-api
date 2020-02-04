import * as express from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as multer from 'multer';
import * as cors from 'cors';
import * as FtpClient from 'ftp';
import loggerMerchant from './logger';
import Respmsg from './responseMessage';
import ResJson from './responseJson';
import * as request from 'supertest';
import { Readable } from 'stream';
import { MerchantRoutes } from './Response'
import { join, basename } from 'path';
import { json, urlencoded } from 'body-parser';
import { createServer, Server } from 'http';
import { ListingElement, Options } from 'ftp';
import { Options as RequestOptions } from 'request';
import { reqPayload, OptsDeleteFileFTP, MulterFile } from './Types';
import { saveFilesToFTPOptions, getProductImagesOpts, RequestTestMethods } from './Types';
import { mkdirSync, statSync, remove, mkdirs, emptyDir, createWriteStream, pathExists, readdir, stat, unlink, rename } from 'fs-extra';
import { mapSeries, waterfall, AsyncResultArrayCallback, AsyncResultIterator, ErrorCallback, AsyncResultCallback as AsyncResultCallback2, eachOf } from 'async';


export interface T {

}

export interface R {

}


export interface AsyncResultCallback<T, R, E = Error> { (err?: E | null, messageOccurred?: R, result?: T): void; }


export const pathStaticFiles = join(__dirname, `../build/static/media`);

export const logLevel = (ResponseCode: number) => ResponseCode == 200 ? 'info' : 'error';

export const pathToLocalImages = (shopName: string, path: string) => `/static/media/${shopName}/${path}/`;

export const merchantMainRoute = '/mlshopmerchant/route/';

export const testRequest = (app: Server, method: RequestTestMethods, url: string, statusCode: number = 200) => {
  return request(app)[method](`${merchantMainRoute}${url}`).expect(200).expect('Content-Type', /json/);
}
// export const encryptPass = (password: string): string => {
//   const KEY = process.env.MERCHANT_SECRET_KEY;
//   return AES.encrypt(password, KEY).toString();
// }

// export const decryptPass = (encryptedPass: string): string => {
//   const KEY = process.env.MERCHANT_SECRET_KEY;
//   return AES.decrypt(encryptedPass, KEY).toString(enc.Utf8);
// }
/**
 * Tests if the item provided is undefined or not.
 * 
 * @example
 * isUndefined(undefined) -> true
 * isUndefined() -> true
 * isUndefined(null) -> false
 * 
 * @param {any} item 
 * @return {Boolean}
 */
export const isUndefined = <T>(item?: T): boolean => {
  return typeof item === 'undefined';
}


/**
 * Tests if the item provided is null or not.
 * 
 * @example
 * isNull(undefined) -> false
 * isNull('') -> false
 * isNull(null) -> true
 * 
 * @param item 
 */
export const isNull = <T>(item?: T): boolean => {
  return (typeof item === 'object' && item === null);
}

export const trim = (str: string): string => {
  return str.trim();
}

/**
 * Tests if the value provided is 'falsy' or not.
 * 
 * Note: There are six values that evaluates to false in javascript.
 * 
 * @example
 * 
 * const falsyValues = [false, '', null, undefined, NaN, 0]
 * 
 * isFalsy(true) -> false
 * isFalsy() -> true
 * isFalsy(undefined) -> true
 * isFalsy(null) -> true
 * isFalsy('') -> true
 * isFalsy(NaN) -> true
 * isFalsy(0) -> true
 * 
 * @param val 
 */
export const isFalsy = <T>(val: T): boolean => {
  let isValFalsy = false;
  switch (typeof val) {
    case "undefined":
      return (isValFalsy = true, isValFalsy);
    case "number":
      if (val === +0 || val === -0) {
        return (isValFalsy = true, isValFalsy);
      }
      //check Nan Value
      if (val !== val) {
        return (isValFalsy = true, isValFalsy);
      }
      break;
    case "object":
      //return true for null value
      if (isNull(val)) {
        return (isValFalsy = true, isValFalsy);
      }
      break;
    case "string":
      //check length of str if 0 return true
      return trim(val).length == 0 ? (isValFalsy = true, isValFalsy) : isValFalsy;
    case "boolean":
      //return false if val is false
      return val === false ? (isValFalsy = true, isValFalsy) : isValFalsy;
    default:
      return isValFalsy;
  }

}


export const getType = <T>(item: T): 'boolean' | 'string' | 'number' | 'object' | 'bigint' | 'symbol' | 'undefined' | 'function' => {
  return typeof item;
}

/**
 * Tests if the item provided is "null" or "undefined".
 * 
 * @example
 * isNullOrUndefined() -> true
 * isNullOrUndefined(true) -> false
 * isNullOrUndefined(null) -> true
 * 
 * @param item 
 */
export const isNullOrUndefined = <T>(item?: T): boolean => {
  return isNull(item) || isUndefined(item);
}

/**
 * Calculates the path to be joined base on "shopName" param and "savePath" param.
 * 
 * @param shopName 
 * @param savePath 
 * 
 * @returns The absolute path for images to be save.
 */
export const saveImagePath = (shopName?: string | boolean | [], savePath?: string | any[]) => {
  const _type = getType(shopName);
  if (_type === 'boolean' || _type === 'object') {
    return 'Shopname must be a string.'
  }
  else if (!shopName || !savePath) {
    return 'Shopname or Save Path must not be empty!';
  }
  else if (typeof shopName !== 'string') {
    return 'Shopname must be a typeof string.';
  }
  else if (typeof savePath !== 'string') {
    return 'Save Path must be a typeof string.';
  }
  else {
    return join(`${pathStaticFiles}`, `/${shopName}/${savePath}`)
  }

}


export const filterFtpFiles = (results: ListingElement[]) => {

  return results.map(item => item.name).filter(item => {
    if (item !== 'Thumbs.db' || item.includes('NaN')) {
      return item;
    }
  })
}


/**
 * getFilesFromFTPServer - Obtain Files From the Remote FTP Server
 * @param  path - Remote Path To Files
 * @param  savePath - Local Path to Save
 * @param messageOccurred - controller used to call this function.
 * @param parentCB - Callback to be called after the operation is done or some error occurred.
 */
export const getFilesFromFTPServer = (path: string, savePath: string, messageOccurred: string, parentCB: AsyncResultArrayCallback<T, Error>, filesToDownload?: string[]) => {

  const ftpInstance = MLShopFTP();

  ftpInstance.on('ready', () => {

    const ftpListCB = (e: Error, results: ListingElement[]) => {
      if (e) {
        loggerMerchant('error', e.message, `[${messageOccurred} ftpInstance.list]`);
        return parentCB(e);
      } else {
        if (!results.length) {
          loggerMerchant('info', `No Files Found on FTP Server.`, `[${messageOccurred} ftpInstance.list]`);
          return parentCB(null, results);
        } else {
          let fileNames = filterFtpFiles(results);
          if (filesToDownload) {
            fileNames = filesToDownload;
          }
          const noImage = getStaticFileName('no_image');
          const mapSeriesIterator: AsyncResultIterator<T, R> = (fileName, cb) => {
            const writable = createWriteStream(`${savePath}/${fileName}`)
            ftpInstance.get(`${path}/${fileName}`, (e: Error, readable: Readable) => {
              if (e) {
                loggerMerchant('error', e.message, `[${messageOccurred} getFilesFromFTPServer() mapSeriesIterator() ftp.get CB]`);
                if (e.message == 'The system cannot find the file specified.') {
                  return cb(null, noImage[0]);
                }
                return cb(e);
              } else {
                readable.pipe(writable);
                loggerMerchant('info', `Success in Getting ${fileName} from FTP Server`,
                  `[${messageOccurred} getFilesFromFTPServer() mapSeriesIterator() ftp.get CB]`);
                readable.on('end', () => {
                  readable.readable
                  cb(null, fileName);
                });
                readable.on('error', (e: Error) => {
                  cb(null, noImage[0]);
                })
              }
            })
          }
          const mapSeriesMasterCB: AsyncResultArrayCallback<R> = (e, results) => {
            ftpInstance.end();
            if (e) {
              return parentCB(e)
            } else {
              loggerMerchant('info', `Files Saved: ${results} from FTP Server`,
                `[${messageOccurred} getFilesFromFTPServer() mapSeriesMasterCB]`);
              return parentCB(null, results);
            }
          }
          mapSeries(fileNames, mapSeriesIterator, mapSeriesMasterCB);
        }
      }
    }
    ftpInstance.list(path, ftpListCB)
  });
  ftpInstance.on('error', (e: Error) => {
    if (e) {
      loggerMerchant('error', e.message, `[${messageOccurred} ftpInstance.on('error')]`);
      return parentCB(e);
    }
  });
};

/**
 * 
 * @param path - remote path to files
 * @param messageOccurred - controller used to call this function.
 */

export const checkFtpFolder = (path: string, parentCB: AsyncResultArrayCallback<T, Error>) => {
  const ftpInstance = MLShopFTP();

  ftpInstance.on('ready', () => {

    const ftpListCB = (e: Error, results: ListingElement[]) => {
      if (e) {
        ftpInstance.mkdir(path, (e: Error) => {
          if (e) {
            loggerMerchant('error', e.message, '[checkFtpFolder() ftpInstance.mkdir err]');
            return parentCB(e);
          }
        })
      } else {
        ftpInstance.end();
        const files = filterFtpFiles(results);
        return parentCB(null, files);
      }

    }
    ftpInstance.list(path, ftpListCB)
  });

  ftpInstance.on('error', e => {
    loggerMerchant('error', e.message, '[checkFtpFolder() ftpInstance.on("error")]');
    return parentCB(e);
  })

}


/**
 * pathToUploadDir
 * @param folderName - Name of the Folder
 * 
 * @returns Full Path to Directory
 */

export const pathToUploadDir = (folderName?: string) => join(__dirname, `../../${process.env.DEV_TMP_PATH}${folderName ? `${folderName}/` : ''}`);


/**
 * @returns Directory Path for Logs Based on environment
 */


export const pathToLogs = () => {
  if (process.env.NODE_ENV == 'production') {
    return process.env.LOG_PATH;
  } else {
    return join(__dirname, process.env.LOG_PATH)
  }
}

/**
 * @returns Directory Path for UI Logs Based on environment
 */

export const pathToUILogs = () => {
  if (process.env.NODE_ENV == 'production') {
    return process.env.LOG_UI_PATH;
  } else {
    return join(__dirname, process.env.LOG_UI_PATH)
  }
}


/**
 * @returns {FtpClient} a new Ftp Instance
 */

export const MLShopFTP = () => {
  const c = new FtpClient();
  const options: Options = {
    host: process.env.FTPHost,
    port: +process.env.FTPPort,
    user: process.env.FTPUser,
    password: process.env.FTPPass,
  }
  c.connect(options)
  return c;

}




export const saveFilesToFTP = (options: saveFilesToFTPOptions) => {

  const { filePaths, shopName, isProduct, messageOccurred,
    parentCallback, saveDirectoryPath } = options;

  // const ftpInstance = new jsftp(ftpOpts);
  const ftpInstance = MLShopFTP();
  const savePath = `/${shopName}/${saveDirectoryPath}`.trim();


  const tasks: Function[] = [
    //Make FTP Directory for saveDirectoryPath
    (cb: ErrorCallback) => {
      ftpInstance.mkdir(savePath, true, (e) => e ? cb(e) : cb());
    },
    //Save Local Files to FTP Server
    (cb: AsyncResultCallback<T, R, Error>) => {
      const mapSeriesIterator: AsyncResultIterator<T, R, Error> = (f: { filePath: string }, cb: Function) => {
        const fileName = basename(f.filePath);

        ftpInstance.put(f.filePath, `${savePath}/${fileName}`, (e: Error) => {
          if (e) {
            loggerMerchant('error', e.message, `[${messageOccurred} mapSeriesIterator err]`);
            return cb(e);
          } else {
            loggerMerchant('info', `Successfully Uploaded File: ${fileName} to Ftp Server.`, `[${messageOccurred} mapSeriesIterator]`);
            return cb(null, fileName);
          }
        });
      };
      const mapSeriesMasterCB: AsyncResultArrayCallback<R> = (e, result) => {
        ftpInstance.end();
        if (e) {
          loggerMerchant('error', e.message, `[${messageOccurred} mapSeriesMasterCB err]`);
          return cb(e);
        } else {
          return cb(null, result);
        }
      }
      mapSeries(filePaths, mapSeriesIterator, mapSeriesMasterCB)
    }
  ]

  ftpInstance.on('ready', () => {
    waterfall(tasks, (e, result) => e ? parentCallback(e) : parentCallback(null, result))
  });


  ftpInstance.on('error', (e: Error) => {
    if (e) {
      loggerMerchant('error', e.message, `[saveFilesToFTP() ${messageOccurred} ftpInstance.on('error')]`);
      return parentCallback(e);
    }
  })


}


/**
 * Delete Directory FTP
 * @param shopName - the name of current shop user
 * @param messageOccurred - controller used to call this function.
 */

export const deleteDirFTP = (path: string, messageOccurred: string): void => {
  //const ftpInstance = new jsftp(ftpOpts);
  const ftpInstance = MLShopFTP();
  //const pathToPermits = `/${shopName}/permits`;
  const ftpReadyCB = () => {

    ftpInstance.list(path, (e: Error, results: ListingElement[]) => {
      if (e) {
        loggerMerchant('error', ` ${e.message}`, `[${messageOccurred} deleteDirFTP() ftpInstance.list]`);
        return;
      } else {
        if (!results.length) {
          deleteDir();
          return;
        } else {
          const fileNames = filterFtpFiles(results);
          const mapSeriesMasterCB = (e: Error, results: any[]) => {
            ftpInstance.end();
            if (e) {
              loggerMerchant('error', e.message, `[${messageOccurred} deleteDirFTP() mapSeriesMasterCB err]`);
              return;
            } else {
              loggerMerchant('info', 'All Files Deleted.', `[${messageOccurred} deleteDirFTP() mapSeriesMasterCB]`);
              deleteDir();
              return;
            }
          };
          mapSeries(fileNames, (fileName, cb) => {
            const opts: OptsDeleteFileFTP = {
              ftp: ftpInstance,
              filePath: `${path}/${fileName}`,
              messageOccurred: `${messageOccurred} mapSeriesIterator`,
              callback: cb
            }
            deleteFileFTP(opts);
          }, mapSeriesMasterCB)
        }
      }
    })
  }

  ftpInstance.on('ready', ftpReadyCB)

  const deleteDir = () => {
    ftpInstance.rmdir(path, true, (e) => {
      if (e) {
        loggerMerchant('error', ` ${e.message}`, `[${messageOccurred} deleteDirFTP() ftpInstance.ls]`);
        return;
      } else {
        loggerMerchant('info', `${path} Dir Deleted.`, `[${messageOccurred} deleteDirFTP()]`);
        return;
      }
    })
  }
}


export const deleteFileFTP = (opts: OptsDeleteFileFTP): void => {
  const {
    ftp, filePath, messageOccurred, callback,
    closeCon
  } = opts;



  ftp.delete(filePath, (e: Error) => {
    if (closeCon) {
      ftp.end();
    }
    const fileName = basename(filePath);
    if (e) {
      loggerMerchant('error', e.message, `[${messageOccurred} deleteFileFTP]`);
      if (e.message == 'The system cannot find the file specified.') {
        return callback(null, fileName)
      } else {
        callback(e)
        return;
      }

    } else {
      loggerMerchant('info', `File from ${filePath} has been deleted.`, `[${messageOccurred} deleteFileFTP]`);
      callback(null, fileName)
    }
  })
}


/**
 * Remove a directory including it's content
 * @param path - path to directory to remove
 * @param messageOccurred - controller used to call this function.
 */


export const removeDir = async (path: string, messageOccurred: string, isFullPath: boolean = false) => {
  try {

    loggerMerchant('info', `Removing Directory ${path}`, `[${messageOccurred} removeDir()]`);
    if (isFullPath) {
      await emptyDir(path);
      await remove(path);
      return;
    } else {
      const [shopName] = path.split('/');
      path = pathToUploadDir(path);
      path = path.substring(0, path.length - 1);
      await emptyDir(path);
      await remove(path);
      await remove(pathToUploadDir(shopName));
    }
  } catch (e) {
    await emptyDir(path);
    await remove(path);
    loggerMerchant('error', `Can\'t Remove Directory ${path} | Error Code: ${e.code} - Error Message : ${e.message} `, `[${messageOccurred} removeDir()]`);
  }
}

/**
 * Makes a Directory Synchronously.
 * 
 * Note: Only use when on application startup phase.
 * 
 * @param path Path to the directory to be created.
 */
export const makeDirSync = (path: string) => {
  try {
    const stateLogs = statSync(path);
    if (!stateLogs.isDirectory()) {
      mkdirSync(path, { recursive: true });
    }
  } catch (e) {
    if (e.code == 'ENOENT') {
      mkdirSync(path, { recursive: true });
    }
  }
}


export let staticFiles: string[] = [];


export const optionsWithAuth = (opts: RequestOptions, token: string): RequestOptions => {
  return { ...opts, auth: { bearer: token } }
}


/**
 * Extracts the token and authType from the "Authorization" request header.
 * 
 * @param req Express Request parameter
 * @returns {object}
 */
export const getToken = (req: express.Request): { authType: 'Bearer' | string, token: string } => {
  const authHeader = req.headers.authorization;
  const [b, token] = authHeader.split(' ');
  return { authType: b, token }
}


/**
 * A middleware that checks if the request has a valid token.
 * 
 * @param req express Request middleware param
 * @param res express Response middleware param
 * @param nxt express Next middleware param
 */
export const verifyToken = (req: express.Request, res: express.Response, nxt: express.NextFunction) => {
  try {
    const t = getToken(req);
    if (isNullOrUndefined(t.authType)) {
      return res.json(ResJson(401, Respmsg(401))).end();
    }
    if (t.authType !== 'Bearer' || isNullOrUndefined(t.token)) {
      return res.json(ResJson(401, Respmsg(401))).end();
    } else {
      nxt();
    }
  } catch (err) {
    loggerMerchant('error', err.message, `[verifyToken]`);
    return res.json(ResJson(401, Respmsg(401))).end();
  }
}


/**
 * Express App Instance
 */

export class App {
  public app: express.Application;
  constructor(private routes: MerchantRoutes[], public port: number | string, private authRoutes: string[]) {
    this.port = port;
    this.routes = routes;
    this.authRoutes = authRoutes;
    this.app = express();
    this.app.set('env', process.env.NODE_ENV);
    this.makeLogsDir();
    this.makeUILogs();
    makeUploadDir();
    //this.makeUploadsDir();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private makeLogsDir(): void {
    makeDirSync(pathToLogs());
  }


  private makeUILogs(): void {
    makeDirSync(pathToUILogs());
  }

  /**
   * Initialize All Routes
   */
  private initializeRoutes(): void {
    this.routes.forEach(routeMerchant => {
      if (this.authRoutes.includes(routeMerchant.path)) {
        this.app.use(routeMerchant.path, verifyToken, routeMerchant.router);
      } else {
        this.app.use(routeMerchant.path, routeMerchant.router);
      }
    });
    this.app.get('*', (req, res) => {
      res.sendFile(join(__dirname, '../build/index.html'));
    })
  }

  /**
   * Initialize Middlewares
   */

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(json());
    //this.app.use(favicon(join(__dirname, '../build', 'favicon.ico')))
    this.app.use(express.static(join(__dirname, '../build')))
    this.app.use(urlencoded({ extended: false }));
  }



  getStaticFiles = async () => {
    try {
      staticFiles = await readdir(pathStaticFiles);
    } catch (e) {
      loggerMerchant('error', `${e.message}`, `[getStaticFiles() App]`);
      staticFiles = [];
    }
  }
  /**
    * Start the App
    * @returns Server instance
  */



  public listen() {
    return createServer(this.app).listen(this.port, () => {
      console.log(`Server listening at port: ${this.port}`);
      //loggerMerchant('info', `Server listening at port: ${this.port}`, `[listen cb App]`);
    })
    // return this.app.listen(this.port, () => {
    //   console.log(`Server listening at port: ${this.port}`);
    //   //loggerMerchant('info', `Server listening at port: ${this.port}`, `[listen cb App]`);
    // })

  }
}




/**
 * Get the maximum number from the file names from the ftp server
 * @param filesToReduce 
 * @param shopName 
 */

export const getMaxNum = (filesToReduce: any[], shopName: string): number => {

  const fileNames = filesToReduce;
  if (!fileNames.length) {
    return 1;
  }
  const max = fileNames.reduce((acc: number, fileName: string) => {
    if (fileName.indexOf(`${shopName}_product`) > -1 && /\d+/.test(fileName)) {
      let comparator = +(/\d+/.exec(fileName)[0]);
      if (comparator > acc) {
        return comparator;
      }
      return acc;
    }
    return acc;
  }, 0)
  return max ? (max + 1) : 1;
}


/**
 * Make Directory or Directories Synchronously
 * @param folderName 
 */

export const makeUploadDir = (folderName?: string) => {
  try {
    const stat = statSync(pathToUploadDir(folderName ? folderName : null));
    if (!stat.isDirectory()) {
      mkdirSync(pathToUploadDir(folderName ? folderName : null), { recursive: true });
    }

  } catch (e) {
    if (e.code == 'ENOENT') {
      mkdirSync(pathToUploadDir(folderName ? folderName : null), { recursive: true });
    }
  }
}


/**
 * Create Directory or Directories Asynchronously 
 * @param folderName Name of the Folder
 * @param defaultToUploadPath true means the directory created will be under the merchant-uploads folder
 * @param cb callback to be called after the operation is done or some error occurred.
 */


export const makeUploadDirAsync = (folderName: string, defaultToUploadPath = true, cb?: AsyncResultCallback<T, Error>) => {
  let path = pathToUploadDir(folderName ? folderName : null)
  if (!defaultToUploadPath) {
    path = folderName;
  }
  mkdirs(path, e => {
    if (e) {
      return cb(e);
    } else {
      loggerMerchant('info', `Directory ${folderName} Created!`, '[makeUploadDirAsync()]');
      if (cb) {
        cb(null)
      }
    }
  })
}



/**
 * Create Directory if it does not exists else call Callback
 * @param path - path to directory to check and make 
 * @param defaultToUploadPath - boolean to indicate if path params should be under uploads folder
 * @param cb - callback to be called after the operation is done or some error occurred.
 */

export function createDirs(path: string, defaultToUploadPath = true, cb: AsyncResultCallback<T, Error>) {


  let pathToCheck = path, parentCB = cb, defaultToPath = defaultToUploadPath;
  const args = Array.from(arguments);
  if (args.length === 2) {
    pathToCheck = args[0];
    parentCB = args[1];
  } else if (args.length === 3) {
    pathToCheck = args[0];
    defaultToPath = args[1];
    parentCB = args[2];
  }

  pathExists(path, (e: Error, exists: boolean) => {
    if (e) {
      return cb(e);
    } else {
      return exists ? cb(null) : makeUploadDirAsync(pathToCheck, defaultToPath, parentCB);
    }
  })
}

/**
 * Deletes a file in a provided filePath
 * @param filePath path to file
 * @param messageOccurred controller used to call this function.
 * @param cb 
 */

export const deleteFile = (filePath: string, messageOccurred: string, cb: AsyncResultCallback<T, R, Error>) => {
  unlink(filePath)
    .then((val) => {
      const fileName = basename(filePath);
      loggerMerchant('info', `File: ${fileName} Deleted.`, `[${messageOccurred} deleteFile unlinkCB]`);
      return cb(null, fileName);
    })
    .catch((e) => {
      loggerMerchant('error', e.message, `[${messageOccurred} deleteFile unlinkCB err]`);
      return cb(e);
    })

  // unlink(filePath, (e) => {
  //   if (e) {
  //     loggerMerchant('error', e.message, `[${messageOccurred} deleteFile unlinkCB err]`);
  //     return cb(e);
  //   } else {
  //     const fileName = basename(filePath);
  //     loggerMerchant('info', `File: ${fileName} Deleted.`, `[${messageOccurred} deleteFile unlinkCB]`);
  //     return cb(null, fileName);
  //   }
  // })

}


/**
 * Delete Files with file size of 0
 * @param path path to local directory
 * @param cb 
 */

export const deleteFiles = (path: string, messageOccurred: string, cb?: AsyncResultCallback<T, R, Error>) => {
  readdir(path, (e, files) => {
    if (e) {
      loggerMerchant('error', e.message, `[${messageOccurred} deleteFiles]`);
      return cb ? cb(e) : e;
    } else {
      if (files.length) {
        let zeroFiles: string[] = [];
        const mapSeriesIterator: AsyncResultIterator<T, R, Error> = (file: string, callB) => {
          let filePath = `${join(path, file)}`;
          stat(filePath, (e, stat) => {
            if (e) {
              if (e.code === 'EPERM') {
                zeroFiles.push(file);
                return callB(null, file);
              } else {
                return callB(e);
              }
            } else {
              if (stat.size === 0) {
                zeroFiles.push(file);
                return deleteFile(filePath, `${messageOccurred} mapSeriesIterator`, callB);
              } else {
                return callB(null, file);
              }
            }
          })
        };
        const mapSeriesMasterCB: AsyncResultArrayCallback<T, Error> = (e, results) => {
          if (e) {
            loggerMerchant('error', e.message, `[${messageOccurred} mapSeriesMasterCB()]`);
            return cb ? cb(null, zeroFiles) : null;
          } else {
            return cb ? cb(null, zeroFiles) : null;
          }
        }
        mapSeries(files, mapSeriesIterator, mapSeriesMasterCB);
      } else {
        return cb ? cb(null, []) : null;
      }
    }
  });
}

/**
 * Check Local Directory for Files
 * @param path path to local directory
 * @param filesToCheck files to check inside the local directory
 * @param cb  callback to be called after the operation is done or some error occurred.
 * @returns an array of Missing Files
 */

export const checkLocalDir = (path: string, filesToCheck: string[], cb: AsyncResultCallback<T, R, Error>) => {
  readdir(path, (e, files) => {
    if (e) {
      loggerMerchant('error', e.message, '[checkLocalDir() readdir err]');
      return cb(e);
    } else {
      let missingFiles: string[] = [];

      if (!files.length) {
        missingFiles = filesToCheck;
      } else {
        for (let i = 0, len = filesToCheck.length; i < len; i++) {
          let currentFile = filesToCheck[i];
          if (!files.includes(currentFile) && !currentFile.includes('NaN')) {
            missingFiles = [...missingFiles, currentFile];
          }
        }
      }
      return cb(null, missingFiles);
    }
  })
}

/**
 * Get The Product Images from the FTP Server
 * @param opts 
 */

export const getProductImages = (opts: getProductImagesOpts) => {
  const {
    parentCB,
    response,
    shopName,
    messageOccurred,
  } = opts;

  const saveProductImagesPath = saveImagePath(shopName, 'product');
  const pathToProductImages = pathToLocalImages(shopName, 'product');
  const tasks: Function[] = [
    (cb: AsyncResultCallback<T, Error>) => {
      //check if product list is in response 
      loggerMerchant('info', 'Checking Product List...', `[${messageOccurred} task1]`);
      const e = new Error(response.ResponseMessage);
      e['code'] = response.ResponseCode;
      e.name = 'No Product List.'
      if (!response.Product_List) {
        return cb(e)
      } else {
        if (!response.Product_List.length) {
          return cb(e);
        } else {
          //make directory for images;
          createDirs(saveProductImagesPath, false, cb);
        }
      }
    },
    (cb: AsyncResultCallback<T, Error>) => {
      // get the product images from ftp server
      let images = response.Product_List.map(o => o.image);
      loggerMerchant('info', 'Mapping Images', `[${messageOccurred} task2]`);
      checkLocalDir(saveProductImagesPath, images, cb);
    },
    (missingFiles: string[], cb: AsyncResultCallback<T, R, Error>) => {
      if (!missingFiles.length) {
        return cb(null, missingFiles);
      } else {
        getFilesFromFTPServer(`/${shopName}/product`, saveProductImagesPath, `${messageOccurred} task3`, cb, missingFiles);
      }
    },
    (files: string[], cb: AsyncResultCallback<T, Error>) => {
      deleteFiles(saveProductImagesPath, `${messageOccurred} task4`, cb);
    },
    (zeroFiles: string[], cb: AsyncResultCallback<T, R, Error>) => {
      const noImage = getStaticFileName('no_image')[0];
      const newProductList = response.Product_List.map(item => {
        const timeStamp = new Date().getTime();
        if (zeroFiles.includes(item.image) || item.image.includes('NaN')) {
          item.imagePath = `/static/media/${noImage}`;
        } else {
          item.imagePath = `${pathToProductImages}${item.image}?${timeStamp}`
        }
        return item;
      });
      return cb(null, newProductList);
    }
  ];

  waterfall(tasks, (e, result: T[]) => {
    if (e) {
      if (e.name === 'No Product List.') {
        return parentCB(e);
      } else {
        const err = new Error(Respmsg(0));
        err['code'] = 500;
        return parentCB(err)
      }
    } else {
      return parentCB(null, result);
    }
  });

}



export const getExt = (filename: string) => {
  if (!filename) {
    return "";
  } else {
    return filename.substring(filename.lastIndexOf('.') + 1);
  }
}


export const getStaticFileName = (fileNameLike?: string) => {
  return staticFiles.filter(file => file.includes(fileNameLike));
}




export const storage = multer.diskStorage({
  destination(req, file, cb) {
    const shopName: string = req['body']['shop_name'] ? req['body']['shop_name'] : req['body']['vendor'];
    let path: string = '';
    switch (req['body']['type']) {
      case 'register':
        path = `${shopName}/permits`;
        break;
      case 'profile':
        path = `${shopName}/profile`;
        break;
      case 'add-product':
      case 'add_product':
        path = `${shopName}/product`
        break;
      default:
        path = `${shopName}`;
        break;
    }
    const tasks: Function[] = [
      //Make Directory for specific Type if it does not exists
      (cb: AsyncResultCallback<T, Error>) => {
        createDirs(path, true, cb);
      }
    ]

    const waterFallCB: AsyncResultCallback<T, R, Error> = (e, r) => {
      if (e) {
        loggerMerchant('error', e.message, `[makeUploadDirAsync()]`);
        makeUploadDir(path);
        return cb(null, pathToUploadDir(path));
      } else {
        return cb(null, pathToUploadDir(path));
      }
    }
    waterfall(tasks, waterFallCB)
    //for linux path
    //cb(null, join(__dirname, '../../', process.env.DEV_TMP_PATH));
  },
  filename(req, file, cb): void {
    //const ext = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
    const ext = getExt(file.originalname);
    cb(null, file.fieldname + '.' + ext)
  }
})

export const upload = multer({
  storage
});

export const registerFiles = upload.fields([{
  name: 'business_permit',
  maxCount: 1
}, {
  name: 'brgy_clearance',
  maxCount: 1
}, {
  name: 'police_clearance',
  maxCount: 1
}, {
  name: 'valid_id',
  maxCount: 1
}]);


export const changeImagesFiles = upload.fields([
  {
    name: 'profile_image',
    maxCount: 1
  },
  {
    name: 'profile_banner',
    maxCount: 1
  }
]);

export const addImageFiles = upload.any();


export const addProducImages = upload.fields([
  {
    maxCount: 1,
    name: 'addProductImage0'
  },
  {
    maxCount: 1,
    name: 'addProductImage1'
  },
  {
    maxCount: 1,
    name: 'addProductImage2'
  },
  {
    maxCount: 1,
    name: 'addProductImage3'
  },
  {
    maxCount: 1,
    name: 'addProductImage4'
  },
])

export const splitString = (str: string, separator: string): string => {
  if (!str || !str.trim().length) {
    return "";
  }
  else if (!str.includes(separator)) {
    return str;
  }
  else {
    const [first, second] = str.split(separator);
    return first;
  }
}

export const fileExtension = (fileName: string): { filename: string, ext: string } => {
  const i = fileName.lastIndexOf('.');
  const filename = fileName.substring(0, i);
  const ext = getExt(fileName);
  return { filename, ext };
}

export const reqOptions = (path: string, o: reqPayload, isJson: boolean = true): RequestOptions => ({
  url: `${process.env.URL}${path}`,
  json: isJson ? isJson : false,
  body: o.body ? o.body : null,
  qs: o.qs ? o.qs : null
});


export const uploadImageFiles = (filesUploaded: MulterFile[], req: express.Request, messageOccurred: string, pathToLocalUpload: string) => {

  const shopName = !isFalsy(req.body.shop_name) ? req.body.shop_name : req.body.vendor;

  return [(cb: AsyncResultCallback2<T, Error>) => {
    //get all files from the shopname ftp server folder
    messageOccurred = 'Add Image - Getting Files From the Ftp Server.';
    loggerMerchant('info', messageOccurred, `[${messageOccurred}]`);
    checkFtpFolder(`${shopName}/product`, cb);
  },
  (files: ListingElement[], cb: AsyncResultCallback2<T, Error>) => {
    //get the maximum file number from all the files
    messageOccurred = 'Add Image - Getting maximum.'
    loggerMerchant('info', messageOccurred, `[${messageOccurred}]`);
    const maximum = getMaxNum(files, shopName);
    return cb(null, maximum);
  },
  (maximum: number, cb: AsyncResultCallback2<T, Error>) => {
    const filePath = join(pathToUploadDir(shopName), pathToLocalUpload);
    messageOccurred = 'Add Image - Read Upload Directory';
    loggerMerchant('info', messageOccurred, `[${messageOccurred}]`);
    readdir(filePath, (e, files) => {
      if (e) {
        return cb(e);
      } else {
        const newFilePaths = [];
        let newFilePath = '';
        eachOf(filesUploaded, (item, index, callback) => {
          const currentFileName = basename(item.path);
          const ext = getExt(currentFileName);
          const filePath = item.path.split(currentFileName)[0];
          newFilePath = join(filePath, `${shopName}_product_${maximum + (+index)}.${ext}`);
          newFilePaths.push({ filePath: newFilePath });
          rename(item.path, newFilePath, (e) => {
            if (e) {
              return callback(e);
            } else {
              callback();
            }
          })
        }, (e) => {
          if (e) {
            loggerMerchant('error', e.message, `[${messageOccurred}]`);
            return cb(e);
          } else {
            return cb(null, newFilePaths);
          }

        })
      }
    })
  },
  (newFilePaths: [{ filePath: string }], cb: AsyncResultCallback<T, Error>) => {
    //upload all the uploaded files to the ftp server
    messageOccurred = 'Add Image - Saving Files to Ftp Server.'
    const opts: saveFilesToFTPOptions = {
      filePaths: newFilePaths,
      isProduct: true,
      messageOccurred,
      parentCallback: cb,
      saveDirectoryPath: 'product',
      shopName
    }
    saveFilesToFTP(opts);
    //cb(null, { ResponseCode: 200, ResponseMessage: 'Success' });
  }]
}

export const forEach = <T>(arr: T[], callback: (item: any, index?: number, arr?: T[]) => any): void => {
  if (arr.length != 0) {
    for (let i = 0, len = arr.length; i < len; i++) {
      callback(arr[i], i, arr)
    }
  }
};

export const isEmpty = <T>(value: T): boolean => {
  if (isFalsy(value)) {
    return true;
  } else {
    switch (typeof value) {
      case "string":
        return trim(value).length > 0 ? false : true;
      case "object":
        if (Array.isArray(value)) {
          return value.length ? false : true;
        } else {
          return Object.keys(value).length > 0 ? false : true
        }
      default:
        return true;
    }
  }
}







