import { Router } from 'express';
import OrderDetails from '../controllers/OrderDetailsController';


const router: Router = Router();


router.get('/', OrderDetails);


export default router;