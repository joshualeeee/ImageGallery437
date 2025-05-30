import express, { RequestHandler } from "express";
import { ImageProvider } from "../imageProvider";

export function registerImageRoutes(router: express.Router, imageProvider: ImageProvider) {
    const getAllImages: RequestHandler = async (req, res, next) => {
        try {
            const searchQuery = req.query.q as string | undefined;
            const images = await imageProvider.getAllImagesWithAuthors(searchQuery);
            res.json(images);
        } catch (error) {
            next(error);
        }
    };

    const searchImages: RequestHandler = async (req, res, next) => {
        try {
            const searchQuery = req.query.q as string;
            console.log('Search query:', searchQuery);
            const images = await imageProvider.getAllImagesWithAuthors(searchQuery);
            res.json(images);
        } catch (error) {
            next(error);
        }
    };

    const updateImageName: RequestHandler = async (req, res, next) => {
        try {
            const { imageId } = req.params;
            const { name } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Name is required' });
                return;
            }

            const matchedCount = await imageProvider.updateImageName(imageId, name);
            
            if (matchedCount === 0) {
                res.status(404).json({ error: 'Image not found' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    router.get("/api/images", getAllImages);
    router.get("/api/images/search", searchImages);
    router.put("/api/images/:imageId", updateImageName);
}