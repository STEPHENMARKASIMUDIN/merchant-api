import { Router } from 'express';
import RemoveImage from '../controllers/RemoveImageController';

const router: Router = Router();

router.post('/', RemoveImage);

export default router;