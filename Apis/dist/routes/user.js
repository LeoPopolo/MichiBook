"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../libs/verifyToken");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
router.post('/register', user_controller_1.register);
router.post('/login', user_controller_1.login);
router.get('/profile', verifyToken_1.tokenValidation, user_controller_1.getProfile);
router.get('/:id', verifyToken_1.tokenValidation, user_controller_1.identifyById);
router.get('/', verifyToken_1.tokenValidation, user_controller_1.getUsers);
router.post('/post', verifyToken_1.tokenValidation, user_controller_1.createPost);
router.post('/comment', verifyToken_1.tokenValidation, user_controller_1.createComment);
router.get('/posts/list', verifyToken_1.tokenValidation, user_controller_1.getFriendshipsPosts);
router.get('/own_posts/list', verifyToken_1.tokenValidation, user_controller_1.getOwnPosts);
router.get('/posts/:id', verifyToken_1.tokenValidation, user_controller_1.getPostsById);
router.delete('/post/:post_id', verifyToken_1.tokenValidation, user_controller_1.deletePost);
router.patch('/friendship_request/:id', verifyToken_1.tokenValidation, user_controller_1.sendFriendshipRequest);
router.get('/friendship_request/list', verifyToken_1.tokenValidation, user_controller_1.getUserRequests);
router.get('/friendships/list', verifyToken_1.tokenValidation, user_controller_1.getFriendships);
router.patch('/accept_friendship/:id', verifyToken_1.tokenValidation, user_controller_1.acceptFriendshipRequest);
router.patch('/decline_friendship/:id', verifyToken_1.tokenValidation, user_controller_1.declineFriendshipRequest);
router.patch('/remove_friendship/:id', verifyToken_1.tokenValidation, user_controller_1.removeFriendshipRequest);
exports.default = router;
//# sourceMappingURL=user.js.map