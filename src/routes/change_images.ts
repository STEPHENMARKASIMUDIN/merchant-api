import { Router } from "express";
import { changeImagesFiles } from "../helpers/Functions";
import ChangeImagesController from "../controllers/ChangeImagesController";


const router: Router = Router();


router.post('/', changeImagesFiles, ChangeImagesController);


export default router;