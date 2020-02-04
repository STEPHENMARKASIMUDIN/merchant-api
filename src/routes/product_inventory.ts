import { Router } from 'express';
import ProductInventory from '../controllers/ProductInventory';

const router: Router = Router();


router.get('/', ProductInventory);


export default router;