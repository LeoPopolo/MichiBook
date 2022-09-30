import { Request, Response } from 'express';
import path from 'path';

export function uploadImage(req: Request, res: Response) {
    res.status(200).json({
        status: 'OK',
        image_id: parseInt(req.file.filename)
    });
}

export function downloadImage(req: Request, res: Response) {
    res.status(200).sendFile( path.resolve( `./src/files/${req.params.file_path}`));
}