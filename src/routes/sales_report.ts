import { Router } from 'express';
import SalesReport from '../controllers/SalesReportController';

const router: Router = Router();

router.get('/', SalesReport);

export default router;