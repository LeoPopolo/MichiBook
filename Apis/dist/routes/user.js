"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../libs/verifyToken");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
router.post('/register', user_controller_1.register);
router.get('/login', user_controller_1.login);
router.get('/', verifyToken_1.tokenValidation, user_controller_1.getUsers);
router.get('/:id', verifyToken_1.tokenValidation, user_controller_1.identifyById);
exports.default = router;
//# sourceMappingURL=user.js.map