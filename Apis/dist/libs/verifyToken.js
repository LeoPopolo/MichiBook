"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenValidation = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado'
        });
    }
    const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET || 'password1234');
    req.userId = payload._id;
    next();
};
exports.tokenValidation = tokenValidation;
//# sourceMappingURL=verifyToken.js.map