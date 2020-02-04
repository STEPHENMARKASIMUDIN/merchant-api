import { Router } from 'express';
import LoggerUIController from '../controllers/LoggerUIController';

const router: Router = Router();

router.post('/', LoggerUIController);


export default router;