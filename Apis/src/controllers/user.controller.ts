import { Request, Response } from 'express';
import { User } from '../models/user';
import conn from '../database';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export async function subscribe(req: Request, res: Response) {
    
    const user: User = new User(req.body.username, req.body.name, req.body.surname, req.body.role, req.body.password, req.body.contact_information);
    
    const tmp_pass = await user.encryptPassword(req.body.password);

    if (tmp_pass) {
        user.password = tmp_pass;
    }

    await conn.query(`SELECT auth_user(${user.toString()})`)
    .then(async response => {
        
        const token = jwt.sign({
            _id: user.username
        }, process.env.TOKEN_SECRET);
     
        user.id = (response as any).rows[0].id;

        res.status(200).json({
            status: 'OK',
            token: token,
            data: user
        });
    })
    .catch(err => {
        return res.status(400).send(err);
    });
};

export async function signin(req: Request, res: Response) {

    await conn.query(`SELECT id, password FROM auth_user WHERE username = '${req.body.username}' AND deleted = FALSE`)
    .then(async resp => {

        if((resp as any).rows.length === 0 || !(resp as any).rows) {
            return res.status(400).json({
                error: 'username or password incorrect'
            });
        } else { 

            const user = new User(
                null, null, null, null,
                (resp as any).rows[0].password,
                null,
                (resp as any).rows[0].id
            );
    
            const correctPassword = await user.validatePassword(req.body.password);
    
            if (!correctPassword) {
                return res.status(400).json({
                    error: 'invalid password'
                });
            }
    
            const token = jwt.sign({
                _id: user.id
            }, process.env.TOKEN_SECRET);
    
            res.header('Authorization', token).json({
                status: 'OK',
                user_id: user.id
            });
    
        }
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export async function users(req: Request, res: Response) {
    let usersArray = [];

    await conn.query(`SELECT id, username, name, surname, email, role
                        FROM system_user
                        WHERE deleted = FALSE`)
    .then(resp => {

        if((resp as any).rows.length === 0) {
            return res.status(404).json({
                error: 'No data found'
            });
        } else {
            usersArray = (resp as any).rows;
    
            res.status(200).json({
                status: 'OK',
                data: usersArray
            }); 
        }
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export async function identifyById(req: Request, res: Response) {

    await conn.query(`SELECT id, username, name, surname, email, role
                        FROM system_user
                        WHERE id = ${req.params.id} AND deleted = FALSE`)
    .then(resp => {

        if((resp as any).rows.length === 0) {
            return res.status(404).json({
                error: 'No data found'
            });
        } else {
            let user = (resp as any).rows[0];
    
            res.status(200).json({
                status: 'OK',
                data: user
            }); 
        }
    })
    .catch(err => {
        return res.status(400).send(err);
    });
}

export async function deleteUser(req: Request, res: Response) {

    await conn.query(`UPDATE system_user
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
}

export async function reactivateUser(req: Request, res: Response) {

    await conn.query(`UPDATE system_user
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
}

export async function setName(req: Request, res: Response) {

    await conn.query(`UPDATE system_user
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
}

export async function setSurname(req: Request, res: Response) {

    await conn.query(`UPDATE system_user
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
}

export async function setEmail(req: Request, res: Response) {

    await conn.query(`UPDATE system_user
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
}

export async function setRole(req: Request, res: Response) {

    await conn.query(`UPDATE system_user
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
}

export async function setPassword(req: Request, res: Response) {

    const user = new User("","","","","",null);

    const tmp_password = await user.encryptPassword(req.body.password);

    if (tmp_password) {
        user.password = tmp_password;
    }

    await conn.query(`UPDATE system_user
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
}