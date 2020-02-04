import { Router } from 'express';
import EditInfo from '../controllers/EditInfoController';


const router: Router = Router();

router.post('/', EditInfo);


export default router;