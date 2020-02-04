import { Router } from 'express';
import Orders from '../controllers/OrdersController';


const router: Router = Router();

router.get('/', Orders);

export default router;