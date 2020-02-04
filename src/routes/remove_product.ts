import { Router } from 'express';
import RemoveProduct from '../controllers/RemoveProductController';

const router: Router = Router();

router.post('/', RemoveProduct);

export default router;