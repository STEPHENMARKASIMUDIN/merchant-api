import * as FtpClient from 'ftp';
import { ListingElement, Options } from 'ftp';
import { AsyncResultCallback, T, R } from './Functions';
import { ProductsResponse } from './Response';
import { AsyncResultObjectCallback, AsyncResultArrayCallback } from 'async';

export type OptsDeleteFileFTP = {
  ftp: FtpClient
  filePath: string
  closeCon?: boolean
  messageOccurred: string
  callback: AsyncResultCallback<T, R, Error>
}

export type StringOrNumber = string | number;
export type StringOrDate = string | Date;
export type ErrorOrNull = Error | null;
export type callbackFtpList = (e?: Error, lastNumber?: number) => void;
export type saveImageToOpts = {
  filesPaths: []
  shopName: string
  savePath: string
  ftp: FtpClient
  isProduct: boolean
  messageOccured: string
  parentCallback: (err: Error | null, result: []) => void
}

export type getProductImagesOpts = {
  response: ProductsResponse
  shopName: string
  messageOccurred: string
  parentCB: AsyncResultArrayCallback<T, Error>
}

export type reqPayload = {
  body?: any
  qs?: any
}


export interface resultMasterCB {
  messageOccurred: string
  newPath: string
}

export interface FilePath { filePath?: string }

export type saveFilesToFTPOptions = {
  filePaths: FilePath[]
  shopName: string
  saveDirectoryPath: string
  isProduct?: boolean
  messageOccurred: string
  parentCallback: (e: ErrorOrNull, result?: any) => void
}


export interface MulterFile {
  /** Field name specified in the form */
  fieldname: string;
  /** Name of the file on the user's computer */
  originalname: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimetype: string;
  /** Size of the file in bytes */
  size: number;
  /** The folder to which the file has been saved (DiskStorage) */
  destination: string;
  /** The name of the file within the destination (DiskStorage) */
  filename: string;
  /** Location of the uploaded file (DiskStorage) */
  path: string;
  /** A Buffer of the entire file (MemoryStorage) */
  buffer: Buffer;
}


export type RequestTestMethods = 'get' | 'post' | 'put' | 'delete';
export type LogLevel = 'info' | 'error' | 'debug';
export type ErrorCB = (e: Error) => any
export type FTPListCB = (e: Error, listing: ListingElement[]) => void