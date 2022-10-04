"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFriendshipRequest = exports.declineFriendshipRequest = exports.acceptFriendshipRequest = exports.getProfile = exports.identifyById = exports.getFriendships = exports.getUserRequests = exports.sendFriendshipRequest = exports.deletePost = exports.createComment = exports.createPost = exports.getOwnPosts = exports.getUsers = exports.getFriendshipsPosts = exports.login = exports.register = void 0;
const user_1 = require("../models/user");
const database_1 = __importDefault(require("../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tmp_password = yield (0, user_1.encryptPassword)(req.body.password);
        const image_path = req.body.image_path ? `'${req.body.image_path}'` : null;
        database_1.default.query(`SELECT webapi_register(
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
            const token = jsonwebtoken_1.default.sign({
                _id: req.body.username
            }, process.env.TOKEN_SECRET);
            const data = JSON.parse(resp.rows[0].webapi_register);
            delete data.user.personal_data.password;
            delete data.user.deleted;
            delete data.user.creation_timestamp;
            // data.user.creation_timestamp = (new Date(data.user.creation_timestamp)).toLocaleString();
            res.status(200).json(Object.assign(Object.assign({}, data), { token }));
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.register = register;
function login(req, res) {
    database_1.default.query(`SELECT webapi_login('${req.body.username}')`)
        .then((resp) => __awaiter(this, void 0, void 0, function* () {
        const user = JSON.parse(resp.rows[0].webapi_login);
        const correctPassword = yield (0, user_1.validatePassword)(req.body.password, user.personal_data.password);
        if (!correctPassword) {
            return res.status(400).json({
                error: 'invalid password'
            });
        }
        const token = jsonwebtoken_1.default.sign({
            _id: user.id
        }, process.env.TOKEN_SECRET);
        delete user.personal_data.password;
        delete user.deleted;
        delete user.creation_timestamp;
        res.header('Authorization', token).json({
            data: user
        });
    }))
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.login = login;
function getFriendshipsPosts(req, res) {
    const page = req.query.page;
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_post_search_by_friendship(${token_id}, ${page})`)
        .then(resp => {
        const posts = JSON.parse(resp.rows[0].webapi_post_search_by_friendship);
        for (let post of posts.posts) {
            delete post.user_owner.deleted;
            delete post.user_owner.creation_timestamp;
            delete post.user_owner.personal_data.password;
        }
        res.status(200).json(Object.assign({}, posts));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.getFriendshipsPosts = getFriendshipsPosts;
function getUsers(req, res) {
    const page = req.query.page;
    let name = req.query.name ? req.query.name : null;
    let surname = req.query.surname ? req.query.surname : null;
    let username = req.query.username ? req.query.username : null;
    if (name !== null && name !== 'null') {
        name = "'" + name + "'";
    }
    if (username !== null && username !== 'null') {
        username = "'" + username + "'";
    }
    if (surname !== null && surname !== 'null') {
        surname = "'" + surname + "'";
    }
    database_1.default.query(`SELECT webapi_auth_user_search(${page}, ${name}, ${surname}, ${username})`)
        .then(resp => {
        const users = JSON.parse(resp.rows[0].webapi_auth_user_search);
        res.status(200).json(Object.assign({}, users));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.getUsers = getUsers;
function getOwnPosts(req, res) {
    const page = req.query.page;
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_post_search_own(${token_id}, ${page})`)
        .then(resp => {
        const posts = JSON.parse(resp.rows[0].webapi_post_search_own);
        for (let post of posts.posts) {
            delete post.user_owner.deleted;
            delete post.user_owner.creation_timestamp;
            delete post.user_owner.personal_data.password;
        }
        res.status(200).json(Object.assign({}, posts));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.getOwnPosts = getOwnPosts;
function createPost(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_create_post(${token_id}, '${req.body.post_text}', ${req.body.image_path})`)
        .then(resp => {
        const post = JSON.parse(resp.rows[0].webapi_create_post);
        delete post.post.user_owner.deleted;
        delete post.post.user_owner.personal_data.password;
        delete post.post.user_owner.creation_timestamp;
        res.status(200).json(Object.assign({}, post));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.createPost = createPost;
function createComment(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_create_comment(${token_id}, '${req.body.post_text}', ${req.body.image_id}, ${req.body.post_id})`)
        .then(resp => {
        const post = JSON.parse(resp.rows[0].webapi_create_comment);
        res.status(200).json(Object.assign({}, post));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.createComment = createComment;
function deletePost(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_delete_post(${token_id}, ${req.params.post_id})`)
        .then(resp => {
        const post = JSON.parse(resp.rows[0].webapi_delete_post);
        res.status(200).json(Object.assign({}, post));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.deletePost = deletePost;
function sendFriendshipRequest(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_friendship_send_request(${token_id}, ${req.params.id})`)
        .then(resp => {
        const friendship = JSON.parse(resp.rows[0].webapi_friendship_send_request);
        delete friendship.friendship.user_emitted.personal_data.password;
        delete friendship.friendship.user_received.personal_data.password;
        res.status(200).json(Object.assign({}, friendship));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.sendFriendshipRequest = sendFriendshipRequest;
function getUserRequests(req, res) {
    const page = req.query.page;
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_friendship_get_user_requests(${page}, ${token_id})`)
        .then(resp => {
        const friendship = JSON.parse(resp.rows[0].webapi_friendship_get_user_requests);
        for (let request of friendship.requests) {
            delete request.user_emitted.personal_data.password;
            delete request.user_received.personal_data.password;
        }
        res.status(200).json(Object.assign({}, friendship));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.getUserRequests = getUserRequests;
function getFriendships(req, res) {
    const page = req.query.page;
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_friendship_search_friends(${page}, ${token_id})`)
        .then(resp => {
        const users = JSON.parse(resp.rows[0].webapi_friendship_search_friends);
        for (let item of users.friends) {
            delete item.personal_data.password;
            delete item.creation_timestamp;
            delete item.deleted;
        }
        res.status(200).json(Object.assign({}, users));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.getFriendships = getFriendships;
function identifyById(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_friendship_identify_by_user_id(${token_id}, ${req.params.id})`)
        .then(resp => {
        const friendship = JSON.parse(resp.rows[0].webapi_friendship_identify_by_user_id);
        delete friendship.user.personal_data.password;
        res.status(200).json(Object.assign({}, friendship));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.identifyById = identifyById;
function getProfile(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_auth_user_identify_by_id(${token_id})`)
        .then(resp => {
        const data = JSON.parse(resp.rows[0].webapi_auth_user_identify_by_id);
        delete data.user.personal_data.password;
        delete data.user.deleted;
        delete data.user.creation_timestamp;
        res.status(200).json(Object.assign({}, data));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.getProfile = getProfile;
function acceptFriendshipRequest(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_accept_friendship(${req.params.id}, ${token_id})`)
        .then(resp => {
        const response = JSON.parse(resp.rows[0].webapi_accept_friendship);
        res.status(200).json(Object.assign({}, response));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.acceptFriendshipRequest = acceptFriendshipRequest;
function declineFriendshipRequest(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_decline_friendship(${req.params.id}, ${token_id})`)
        .then(resp => {
        const response = JSON.parse(resp.rows[0].webapi_decline_friendship);
        res.status(200).json(Object.assign({}, response));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.declineFriendshipRequest = declineFriendshipRequest;
function removeFriendshipRequest(req, res) {
    const data = jsonwebtoken_1.default.decode(req.headers.authorization);
    const token_id = data._id;
    database_1.default.query(`SELECT webapi_remove_friendship(${req.params.id}, ${token_id})`)
        .then(resp => {
        const response = JSON.parse(resp.rows[0].webapi_remove_friendship);
        res.status(200).json(Object.assign({}, response));
    })
        .catch(err => {
        return res.status(400).send(err);
    });
}
exports.removeFriendshipRequest = removeFriendshipRequest;
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
//# sourceMappingURL=user.controller.js.map