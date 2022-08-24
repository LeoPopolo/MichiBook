"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../libs/verifyToken");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
router.post('/signin', user_controller_1.signin);
router.post('/', user_controller_1.subscribe);
router.get('/', verifyToken_1.tokenValidation, user_controller_1.users);
router.get('/:id', verifyToken_1.tokenValidation, user_controller_1.identifyById);
router.delete('/:id', verifyToken_1.tokenValidation, user_controller_1.deleteUser);
router.patch('/reactivate/:id', verifyToken_1.tokenValidation, user_controller_1.reactivateUser);
router.patch('/name/:id', verifyToken_1.tokenValidation, user_controller_1.setName);
router.patch('/surname/:id', verifyToken_1.tokenValidation, user_controller_1.setSurname);
router.patch('/email/:id', verifyToken_1.tokenValidation, user_controller_1.setEmail);
router.patch('/role/:id', verifyToken_1.tokenValidation, user_controller_1.setRole);
router.patch('/password/:id', verifyToken_1.tokenValidation, user_controller_1.setPassword);
exports.default = router;
//# sourceMappingURL=user.js.map