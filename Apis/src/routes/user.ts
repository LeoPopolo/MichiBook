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
         identifyById,
         getUsers, 
         getProfile,
         getPostsById
} from '../controllers/user.controller';

router.post('/register', register);
router.post('/login', login);

router.get('/profile', tokenValidation, getProfile);
router.get('/:id', tokenValidation, identifyById);
router.get('/', tokenValidation, getUsers);
router.post('/post', tokenValidation, createPost);
router.post('/comment', tokenValidation, createComment);
router.get('/posts/list', tokenValidation, getFriendshipsPosts);
router.get('/own_posts/list', tokenValidation, getOwnPosts);
router.get('/posts/:id', tokenValidation, getPostsById);
router.delete('/post/:post_id', tokenValidation, deletePost);

router.patch('/friendship_request/:id', tokenValidation, sendFriendshipRequest);
router.get('/friendship_request/list', tokenValidation, getUserRequests);
router.get('/friendships/list', tokenValidation, getFriendships);
router.patch('/accept_friendship/:id', tokenValidation, acceptFriendshipRequest);
router.patch('/decline_friendship/:id', tokenValidation, declineFriendshipRequest);
router.patch('/remove_friendship/:id', tokenValidation, removeFriendshipRequest);

export default router;