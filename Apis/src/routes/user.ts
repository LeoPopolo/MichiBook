import { Router } from 'express';
import { tokenValidation } from '../libs/verifyToken';

const router: Router = Router();

import { createUser, 
         signin, 
         users, 
         identifyById, 
         setName, 
         setSurname,
         setEmail, 
         setPassword, 
         setRole, 
         deleteUser,
         reactivateUser}  from '../controllers/user.controller';

router.post('/signin', signin);
router.post('/', tokenValidation, createUser);

router.get('/', tokenValidation, users);
router.get('/:id', tokenValidation, identifyById);

router.delete('/:id', tokenValidation, deleteUser);

router.patch('/reactivate/:id', tokenValidation, reactivateUser);
router.patch('/name/:id', tokenValidation, setName);
router.patch('/surname/:id', tokenValidation, setSurname);
router.patch('/email/:id', tokenValidation, setEmail);
router.patch('/role/:id', tokenValidation, setRole);
router.patch('/password/:id', tokenValidation, setPassword);

export default router;