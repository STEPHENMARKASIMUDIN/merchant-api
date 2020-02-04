import { Router } from 'express';
import * as multer from 'multer';
import Register from '../controllers/RegisterController';
import { registerFiles } from '../helpers/Functions';


const router: Router = Router();

router.post('/', registerFiles, Register);

export default router;