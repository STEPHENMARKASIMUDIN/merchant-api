import PaymentDetailsController from "../controllers/PaymentDetailsController";
import { Router } from "express";


const router: Router = Router();

router.post('/', PaymentDetailsController);


export default router;



