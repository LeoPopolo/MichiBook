"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const files_controller_1 = require("../controllers/files.controller");
let storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/files');
    },
    filename: (req, file, cb) => {
        cb(null, (Date.now()).toString() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.post('/upload', upload.single('file'), files_controller_1.uploadImage);
router.get('/download/:file_path', files_controller_1.downloadImage);
exports.default = router;
//# sourceMappingURL=files.js.map