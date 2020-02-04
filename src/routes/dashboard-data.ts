import { Router } from 'express';
import DashboardData from '../controllers/DashboardDataController';


const router: Router = Router();


router.get('/', DashboardData);


export default router;