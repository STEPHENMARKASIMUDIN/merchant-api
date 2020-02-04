import { Router } from 'express';
import GetUserDetailsController from '../controllers/GetUserDetailsController';

const router: Router = Router();

router.get('/', GetUserDetailsController);


export default router;