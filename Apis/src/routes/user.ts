import { Router } from 'express';
import { tokenValidation } from '../libs/verifyToken';

const router: Router = Router();

import { createPost,
         createComment,
         login, 
         register,
         getFriendshipsPosts,
         deletePost,
         getOwnPosts,
         sendFriendshipRequest,
         getUserRequests,
         getFriendships,
         acceptFriendshipRequest,
         declineFriendshipRequest,
         removeFriendshipRequest,
         identifyById }  from '../controllers/user.controller';

router.post('/register', register);
router.get('/login', login);

router.post('/post', tokenValidation, createPost);
router.post('/comment', tokenValidation, createComment);
router.get('/posts', tokenValidation, getFriendshipsPosts);
router.get('/own_posts', tokenValidation, getOwnPosts);
router.delete('/post/:post_id', tokenValidation, deletePost);
router.get('/:id', tokenValidation, identifyById);

router.patch('/friendship_request/:id', tokenValidation, sendFriendshipRequest);
router.get('/friendship_request', tokenValidation, getUserRequests);
router.get('/friendships', tokenValidation, getFriendships);
router.patch('/accept_friendship/:id', tokenValidation, acceptFriendshipRequest);
router.patch('/decline_friendship/:id', tokenValidation, declineFriendshipRequest);
router.patch('/remove_friendship/:id', tokenValidation, removeFriendshipRequest);

export default router;