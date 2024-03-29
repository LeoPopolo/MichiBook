import { Request, Response } from 'express';
import { encryptPassword, validatePassword } from '../models/user';
import conn from '../database';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export async function register(req: Request, res: Response) {

    const tmp_password = await encryptPassword(req.body.password);
    const image_path = req.body.image_path ? `'${req.body.image_path}'` : null;

    conn.query(`SELECT webapi_register(
                                '${req.body.name}',
                                '${req.body.surname}',
                                '${req.body.username}',
                                '${tmp_password}',
                                '${req.body.contact_information.email}',
                                '${req.body.contact_information.phone_number}',
                                '${req.body.contact_information.address}',
                                ${image_path},
                                '${req.body.profile_description}'
                            )`)
    .then(resp => {

        const token = jwt.sign({
            _id: req.body.username
        }, process.env.TOKEN_SECRET);
     
        const data = JSON.parse(resp.rows[0].webapi_register);

        delete data.user.personal_data.password;
        delete data.user.deleted;
        delete data.user.creation_timestamp

        // data.user.creation_timestamp = (new Date(data.user.creation_timestamp)).toLocaleString();

        res.status(200).json({
            ...data,
            token
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function login(req: Request, res: Response) {

    conn.query(`SELECT webapi_login('${req.body.username}')`)
    .then(async resp => {

        const user = JSON.parse(resp.rows[0].webapi_login);

        const correctPassword = await validatePassword(req.body.password, user.personal_data.password);
    
        if (!correctPassword) {
            return res.status(400).json({
                error: 'invalid password'
            });
        }

        const token = jwt.sign({
            _id: user.id
        }, process.env.TOKEN_SECRET);

        delete user.personal_data.password;
        delete user.deleted;
        delete user.creation_timestamp;

        res.header('Authorization', token).json({
            data: user
        });        
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function getFriendshipsPosts(req: Request, res: Response) {
    
    const page = req.query.page;

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_post_search_by_friendship(${token_id}, ${page})`)
    .then(resp => {
                
        const posts = JSON.parse(resp.rows[0].webapi_post_search_by_friendship);

        for (let post of posts.posts) {
            delete post.user_owner.deleted;
            delete post.user_owner.creation_timestamp;
            delete post.user_owner.personal_data.password;
        }

        res.status(200).json({
            ...posts
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function getPostsById(req: Request, res: Response) {

    const page = req.query.page;

    conn.query(`SELECT webapi_post_search_by_id(${req.params.id}, ${page})`)
    .then(resp => {
                
        const posts = JSON.parse(resp.rows[0].webapi_post_search_by_id);

        for (let post of posts.posts) {
            delete post.user_owner.deleted;
            delete post.user_owner.creation_timestamp;
            delete post.user_owner.personal_data.password;
        }

        res.status(200).json({
            ...posts
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function getUsers(req: Request, res: Response) {
    
    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    const page = req.query.page;
    let filter_string = req.query.filter_string ? req.query.filter_string : null;

    if (filter_string !== null && filter_string !== 'null') {
        filter_string = "'" + filter_string + "'"; 
    }
    
    conn.query(`SELECT webapi_auth_user_search_with_friendship_status(${page}, ${token_id}, ${filter_string})`)
    .then(resp => {
        
        const users = JSON.parse(resp.rows[0].webapi_auth_user_search_with_friendship_status);

        for (let user of users.users) {
            delete user.deleted;
            delete user.personal_data.password;
            delete user.creation_timestamp;
        }

        res.status(200).json({
            ...users
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send(err);
    });
}

export function getOwnPosts(req: Request, res: Response) {
    
    const page = req.query.page;

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_post_search_own(${token_id}, ${page})`)
    .then(resp => {
                
        const posts = JSON.parse(resp.rows[0].webapi_post_search_own);

        for (let post of posts.posts) {
            delete post.user_owner.deleted;
            delete post.user_owner.creation_timestamp;
            delete post.user_owner.personal_data.password;
        }

        res.status(200).json({
            ...posts
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function createPost(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_create_post(${token_id}, '${req.body.post_text}', ${req.body.image_path})`)
    .then(resp => {
                
        const post = JSON.parse(resp.rows[0].webapi_create_post);

        delete post.post.user_owner.deleted;
        delete post.post.user_owner.personal_data.password;
        delete post.post.user_owner.creation_timestamp;

        res.status(200).json({
            ...post
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function createComment(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_create_comment(${token_id}, '${req.body.post_text}', ${req.body.image_id}, ${req.body.post_id})`)
    .then(resp => {
                
        const post = JSON.parse(resp.rows[0].webapi_create_comment);

        res.status(200).json({
            ...post
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function deletePost(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_delete_post(${token_id}, ${req.params.post_id})`)
    .then(resp => {
                
        const post = JSON.parse(resp.rows[0].webapi_delete_post);

        res.status(200).json({
            ...post
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function sendFriendshipRequest(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_friendship_send_request(${token_id}, ${req.params.id})`)
    .then(resp => {
                
        const friendship = JSON.parse(resp.rows[0].webapi_friendship_send_request);

        delete friendship.friendship.user_emitted.personal_data.password;
        delete friendship.friendship.user_received.personal_data.password;
        
        res.status(200).json({
            ...friendship
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function getUserRequests(req: Request, res: Response) {

    let page = req.query.page;

    if (!page)
        page = '1';

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_friendship_get_user_requests(${page}, ${token_id})`)
    .then(resp => {

        const friendship = JSON.parse(resp.rows[0].webapi_friendship_get_user_requests);
        
        for (let request of friendship.requests) {
            delete request.user_emitted.personal_data.password;
            delete request.user_received.personal_data.password;
        }

        res.status(200).json({
            ...friendship
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function getFriendships(req: Request, res: Response) {

    const page = req.query.page;

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_friendship_search_friends(${page}, ${token_id})`)
    .then(resp => {

        const users = JSON.parse(resp.rows[0].webapi_friendship_search_friends);
        
        for (let item of users.friends) {
            delete item.personal_data.password;
            delete item.creation_timestamp;
            delete item.deleted;
        }

        res.status(200).json({
            ...users
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function identifyById(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_friendship_identify_by_user_id(${token_id}, ${req.params.id})`)
    .then(resp => {

        const friendship = JSON.parse(resp.rows[0].webapi_friendship_identify_by_user_id);

        delete friendship.user.personal_data.password;

        res.status(200).json({
            ...friendship
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function getProfile(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_auth_user_identify_by_id(${token_id})`)
    .then(resp => {

        const data = JSON.parse(resp.rows[0].webapi_auth_user_identify_by_id);

        delete data.user.personal_data.password;
        delete data.user.deleted;
        delete data.user.creation_timestamp;

        res.status(200).json({
            ...data
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function acceptFriendshipRequest(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_accept_friendship(${req.params.id}, ${token_id})`)
    .then(resp => {

        const response = JSON.parse(resp.rows[0].webapi_accept_friendship);

        res.status(200).json({
            ...response
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function declineFriendshipRequest(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_decline_friendship(${req.params.id}, ${token_id})`)
    .then(resp => {

        const response = JSON.parse(resp.rows[0].webapi_decline_friendship);

        res.status(200).json({
            ...response
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export function removeFriendshipRequest(req: Request, res: Response) {

    const data = jwt.decode(req.headers.authorization);
    const token_id = (data as any)._id;

    conn.query(`SELECT webapi_remove_friendship(${req.params.id}, ${token_id})`)
    .then(resp => {

        const response = JSON.parse(resp.rows[0].webapi_remove_friendship);

        res.status(200).json({
            ...response
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

// export async function setName(req: Request, res: Response) {

//     await conn.query(`UPDATE system_user
//                         SET name = '${req.body.name}'
//                         WHERE id = ${req.params.id}`)
//     .then(() => {

//         res.status(200).json({
//             status: 'OK',
//             message: 'Operation completed'
//         }); 
//     })
//     .catch(err => {
//         return res.status(400).send(err);
//     });
// }

// export async function setPassword(req: Request, res: Response) {

//     const user = new User("","","","","",null);

//     const tmp_password = await user.encryptPassword(req.body.password);

//     if (tmp_password) {
//         user.password = tmp_password;
//     }

//     await conn.query(`UPDATE system_user
//                         SET password = '${user.password}'
//                         WHERE id = ${req.params.id}`)
//     .then(() => {

//         res.status(200).json({
//             status: 'OK',
//             message: 'Operation completed'
//         }); 
//     })
//     .catch(err => {
//         return res.status(400).send(err);
//     });
// }