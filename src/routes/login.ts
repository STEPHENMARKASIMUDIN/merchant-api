import { Router } from 'express';
import LoginController from '../controllers/LoginController';
const router: Router = Router();

router.post('/', LoginController)

export default router;
