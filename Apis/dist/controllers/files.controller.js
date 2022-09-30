"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImage = exports.uploadImage = void 0;
const path_1 = __importDefault(require("path"));
function uploadImage(req, res) {
    res.status(200).json({
        status: 'OK',
        image_id: parseInt(req.file.filename)
    });
}
exports.uploadImage = uploadImage;
function downloadImage(req, res) {
    res.status(200).sendFile(path_1.default.resolve(`./src/files/${req.params.file_path}`));
}
exports.downloadImage = downloadImage;
//# sourceMappingURL=files.controller.js.map