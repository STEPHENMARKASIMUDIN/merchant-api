import Products from "../controllers/ProductsController";
import { Router } from 'express';


const router: Router = Router();

router.get('/', Products);

export default router;