import { Router } from 'express';
import ResetPassword from '../controllers/ResetPasswordController';


const router: Router = Router();

router.post('/', ResetPassword);


export default router;