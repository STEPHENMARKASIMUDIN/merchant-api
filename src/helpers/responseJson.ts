
type resJson = { ResponseCode: number, ResponseMessage: string, data?: any };

const responseJson = (resCode: number, resMsg: string, data?: any): resJson => {
  if (!data) {
    return { ResponseCode: resCode, ResponseMessage: resMsg }
  } else {
    return { ResponseCode: resCode, ResponseMessage: resMsg, data }
  }
}


export default responseJson;