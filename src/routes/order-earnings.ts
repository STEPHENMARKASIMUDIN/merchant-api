import { Router } from 'express';
import OrderEarnings from '../controllers/OrderEarningsController';

const router: Router = Router();

router.get('/', OrderEarnings);

export default router;