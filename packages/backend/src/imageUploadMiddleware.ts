import { Request, Response, NextFunction } from "express";
import multer from "multer";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        const path = process.env.IMAGE_UPLOAD_DIR;
        if (!path) {
            throw new Error("Missing path name from environment variables");
        }
        cb(null, path)
    },
    filename: function (req, file, cb) {
        const supportedTypes = ["image/jpg", "image/jpeg", "image/png"];
        if (!supportedTypes.includes(file.mimetype)) {
            cb(new ImageFormatError("Unsupported image type"), "");
        }
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + file.mimetype.slice("image/".length);
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err); // Some other error, let the next middleware handle it
}