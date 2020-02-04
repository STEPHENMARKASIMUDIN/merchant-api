import { Router } from 'express';
import DashboardController from "../controllers/DashboardController";



const router: Router = Router();
router.post('/', DashboardController);



export default router;

