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
exports.identifyById = exports.getUsers = exports.login = exports.register = void 0;
const user_1 = require("../models/user");
const database_1 = __importDefault(require("../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tmp_password = yield (0, user_1.encryptPassword)(req.body.password);
        yield database_1.default.query(`SELECT webapi_register(
                                '${req.body.name}',
                                '${req.body.surname}',
                                '${req.body.username}',
                                '${tmp_password}',
                                '${req.body.contact_information.email}',
                                '${req.body.contact_information.phone_number}',
                                '${req.body.contact_information.address}'
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
    return __awaiter(this, void 0, void 0, function* () {
        let usersArray = [];
        yield database_1.default.query(`SELECT id, username, name, surname, email, role
                        FROM system_user
                        WHERE deleted = FALSE`)
            .then(resp => {
            if (resp.rows.length === 0) {
                return res.status(404).json({
                    error: 'No data found'
                });
            }
            else {
                usersArray = resp.rows;
                res.status(200).json({
                    status: 'OK',
                    data: usersArray
                });
            }
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.login = login;
function getUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let usersArray = [];
        yield database_1.default.query(`SELECT id, username, name, surname, email, role
                        FROM system_user
                        WHERE deleted = FALSE`)
            .then(resp => {
            if (resp.rows.length === 0) {
                return res.status(404).json({
                    error: 'No data found'
                });
            }
            else {
                usersArray = resp.rows;
                res.status(200).json({
                    status: 'OK',
                    data: usersArray
                });
            }
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.getUsers = getUsers;
function identifyById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`SELECT id, username, name, surname, email, role
                        FROM system_user
                        WHERE id = ${req.params.id} AND deleted = FALSE`)
            .then(resp => {
            if (resp.rows.length === 0) {
                return res.status(404).json({
                    error: 'No data found'
                });
            }
            else {
                let user = resp.rows[0];
                res.status(200).json({
                    status: 'OK',
                    data: user
                });
            }
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.identifyById = identifyById;
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