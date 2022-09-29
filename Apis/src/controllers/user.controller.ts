import { Request, Response } from 'express';
import { encryptPassword, validatePassword } from '../models/user';
import conn from '../database';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export async function register(req: Request, res: Response) {

    const tmp_password = await encryptPassword(req.body.password);

    await conn.query(`SELECT webapi_register(
                                '${req.body.name}',
                                '${req.body.surname}',
                                '${req.body.username}',
                                '${tmp_password}',
                                '${req.body.contact_information.email}',
                                '${req.body.contact_information.phone_number}',
                                '${req.body.contact_information.address}'
                            )`)
    .then(resp => {

        const token = jwt.sign({
            _id: req.body.username
        }, process.env.TOKEN_SECRET);
     
        const data = JSON.parse((resp as any).rows[0].webapi_register);

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

export async function login(req: Request, res: Response) {
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

export async function getUsers(req: Request, res: Response) {
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