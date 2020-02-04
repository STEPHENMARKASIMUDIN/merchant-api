import { Router } from 'express';
import EditVariantController from '../controllers/EditVariantController';

const router: Router = Router();

router.post('/', EditVariantController);


export default router;