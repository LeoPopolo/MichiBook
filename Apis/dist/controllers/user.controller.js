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
exports.setPassword = exports.setRole = exports.setEmail = exports.setSurname = exports.setName = exports.reactivateUser = exports.deleteUser = exports.identifyById = exports.users = exports.signin = exports.subscribe = void 0;
const user_1 = require("../models/user");
const database_1 = __importDefault(require("../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function subscribe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = new user_1.User(req.body.username, req.body.name, req.body.surname, req.body.role, req.body.password, req.body.contact_information);
        const tmp_pass = yield user.encryptPassword(req.body.password);
        if (tmp_pass) {
            user.password = tmp_pass;
        }
        yield database_1.default.query(`SELECT auth_user(${user.toString()})`)
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            const token = jsonwebtoken_1.default.sign({
                _id: user.username
            }, process.env.TOKEN_SECRET);
            user.id = response.rows[0].id;
            res.status(200).json({
                status: 'OK',
                token: token,
                data: user
            });
        }))
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.subscribe = subscribe;
;
function signin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`SELECT id, password FROM auth_user WHERE username = '${req.body.username}' AND deleted = FALSE`)
            .then((resp) => __awaiter(this, void 0, void 0, function* () {
            if (resp.rows.length === 0 || !resp.rows) {
                return res.status(400).json({
                    error: 'username or password incorrect'
                });
            }
            else {
                const user = new user_1.User(null, null, null, null, resp.rows[0].password, null, resp.rows[0].id);
                const correctPassword = yield user.validatePassword(req.body.password);
                if (!correctPassword) {
                    return res.status(400).json({
                        error: 'invalid password'
                    });
                }
                const token = jsonwebtoken_1.default.sign({
                    _id: user.id
                }, process.env.TOKEN_SECRET);
                res.header('Authorization', token).json({
                    status: 'OK',
                    user_id: user.id
                });
            }
        }))
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.signin = signin;
function users(req, res) {
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
exports.users = users;
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
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`UPDATE system_user
                        SET deleted = TRUE
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.deleteUser = deleteUser;
function reactivateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`UPDATE system_user
                        SET deleted = FALSE
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.reactivateUser = reactivateUser;
function setName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`UPDATE system_user
                        SET name = '${req.body.name}'
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.setName = setName;
function setSurname(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`UPDATE system_user
                        SET surname = '${req.body.surname}'
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.setSurname = setSurname;
function setEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`UPDATE system_user
                        SET email = '${req.body.email}'
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.setEmail = setEmail;
function setRole(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query(`UPDATE system_user
                        SET role = '${req.body.role}'
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.setRole = setRole;
function setPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = new user_1.User("", "", "", "", "", null);
        const tmp_password = yield user.encryptPassword(req.body.password);
        if (tmp_password) {
            user.password = tmp_password;
        }
        yield database_1.default.query(`UPDATE system_user
                        SET password = '${user.password}'
                        WHERE id = ${req.params.id}`)
            .then(() => {
            res.status(200).json({
                status: 'OK',
                message: 'Operation completed'
            });
        })
            .catch(err => {
            return res.status(400).send(err);
        });
    });
}
exports.setPassword = setPassword;
//# sourceMappingURL=user.controller.js.map