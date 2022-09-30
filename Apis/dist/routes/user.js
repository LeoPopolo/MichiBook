"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../libs/verifyToken");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
router.post('/register', user_controller_1.register);
router.get('/login', user_controller_1.login);
router.get('/:id', verifyToken_1.tokenValidation, user_controller_1.identifyById);
router.get('/', verifyToken_1.tokenValidation, user_controller_1.getUsers);
router.post('/post', verifyToken_1.tokenValidation, user_controller_1.createPost);
router.post('/comment', verifyToken_1.tokenValidation, user_controller_1.createComment);
router.get('/posts', verifyToken_1.tokenValidation, user_controller_1.getFriendshipsPosts);
router.get('/own_posts', verifyToken_1.tokenValidation, user_controller_1.getOwnPosts);
router.delete('/post/:post_id', verifyToken_1.tokenValidation, user_controller_1.deletePost);
router.patch('/friendship_request/:id', verifyToken_1.tokenValidation, user_controller_1.sendFriendshipRequest);
router.get('/friendship_request', verifyToken_1.tokenValidation, user_controller_1.getUserRequests);
router.get('/friendships', verifyToken_1.tokenValidation, user_controller_1.getFriendships);
router.patch('/accept_friendship/:id', verifyToken_1.tokenValidation, user_controller_1.acceptFriendshipRequest);
router.patch('/decline_friendship/:id', verifyToken_1.tokenValidation, user_controller_1.declineFriendshipRequest);
router.patch('/remove_friendship/:id', verifyToken_1.tokenValidation, user_controller_1.removeFriendshipRequest);
exports.default = router;
//# sourceMappingURL=user.js.map