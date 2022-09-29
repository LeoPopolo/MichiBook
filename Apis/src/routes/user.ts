import { Router } from 'express';
import { tokenValidation } from '../libs/verifyToken';

const router: Router = Router();

import { getUsers, 
         identifyById, 
         login, 
         register }  from '../controllers/user.controller';

router.post('/register', register);
router.get('/login', login);

router.get('/', tokenValidation, getUsers);
router.get('/:id', tokenValidation, identifyById);

export default router;