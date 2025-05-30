import express from "express";
import { ImageProvider } from "../imageProvider";
import { ObjectId } from "mongodb";

const MAX_NAME_LENGTH = 100;

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
    app.get("/api/images", async (req, res, next) => {
        try {
            const searchQuery = req.query.q as string | undefined;
            const images = await imageProvider.getAllImagesWithAuthors(searchQuery);
            res.json(images);
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/images/search", async (req, res, next) => {
        try {
            const searchQuery = req.query.q as string;
            console.log('Search query:', searchQuery);
            const images = await imageProvider.getAllImagesWithAuthors(searchQuery);
            res.json(images);
        } catch (error) {
            next(error);
        }
    });

    app.put("/api/images/:imageId", async (req, res, next) => {
        try {
            const { imageId } = req.params;
            const { name } = req.body;

            // Check if name is provided
            if (!name) {
                res.status(400).json({
                    error: "Bad Request",
                    message: "Image name is required"
                });
                return;
            }

            // Check if name is too long
            if (name.length > MAX_NAME_LENGTH) {
                res.status(422).json({
                    error: "Unprocessable Entity",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
                });
                return;
            }

            // Check if ID is valid
            if (!ObjectId.isValid(imageId)) {
                res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
                return;
            }

            const matchedCount = await imageProvider.updateImageName(imageId, name);
            
            if (matchedCount === 0) {
                res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    });
}