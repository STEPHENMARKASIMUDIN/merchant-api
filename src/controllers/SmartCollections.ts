import { Request, Response, Router } from 'express';
import { get, RequestCallback, Options } from 'request';
import { SmartCollectionResponse } from '../helpers/Response'
import ResMsg from '../helpers/responseMessage';
import ResJson from '../helpers/responseJson';


const router: Router = Router();

router.get('/', (req: Request, res: Response) => {


  let o: Options = {
    url: `${process.env.URL}smart_collection`,
    json: true
  }

  function smartCollectionsRequestCallback(e, r, b: SmartCollectionResponse): RequestCallback {

    return;
  }

  get(o, smartCollectionsRequestCallback);

});


export default router;