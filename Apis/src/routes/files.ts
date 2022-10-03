import { Router } from 'express';
import path from 'path';
import multer from 'multer';

import { downloadImage, uploadImage } from '../controllers/files.controller';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/files')
    },
    filename: (req, file, cb) => {
        cb(null, (Date.now()).toString() + path.extname(file.originalname))
    } 
});

const upload = multer( { storage } );

const router: Router = Router();

router.post('/upload', upload.single('file'), uploadImage);
router.get('/download/:file_path', downloadImage);

export default router;