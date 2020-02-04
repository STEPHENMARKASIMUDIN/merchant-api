import AddEditProductController from "../controllers/Add-Edit-ProductController";
import { Router } from 'express';
import { addProducImages, addImageFiles } from "../helpers/Functions";

const router: Router = Router();

router.post('/', addImageFiles, AddEditProductController);

export default router;