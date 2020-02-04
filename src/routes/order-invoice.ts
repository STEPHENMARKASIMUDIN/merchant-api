import { Router } from 'express';
import OrderInvoice from "../controllers/OrderInvoiceController";


const router: Router = Router();

router.get('/', OrderInvoice);

export default router;
