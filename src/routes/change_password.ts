import { Router } from 'express';
import ChangePassword from '../controllers/ChangePasswordController';


const router: Router = Router();

router.post('/', ChangePassword);


export default router;