import { Router } from 'express';
import ProductDetails from '../controllers/ProductDetailsController';

const router: Router = Router();

router.get('/', ProductDetails);

export default router;

