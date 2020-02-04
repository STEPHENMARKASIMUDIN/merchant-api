import { Router } from "express";
import LogoutController from "../controllers/LogoutController";

const router: Router = Router();

router.post('/', LogoutController);


export default router;