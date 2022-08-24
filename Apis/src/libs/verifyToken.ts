import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface payload {
    _id: string;
    iat: number;
    exp: number;
}

export const tokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado'
        });
    }
    
    const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'password1234') as payload;
    req.userId = payload._id;
    next();
}