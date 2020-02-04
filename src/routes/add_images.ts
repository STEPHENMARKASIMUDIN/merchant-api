import { Router } from 'express';
import { addImageFiles } from '../helpers/Functions';
import AddImage from '../controllers/AddImageController';


const router: Router = Router();


router.post('/', addImageFiles, AddImage);


export default router;