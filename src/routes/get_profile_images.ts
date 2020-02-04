import { Router } from 'express';
import GetProfileImagesPaths from "../controllers/GetProfileImagesPathsController";


const router: Router = Router();

router.get('/', GetProfileImagesPaths);


export default router;
