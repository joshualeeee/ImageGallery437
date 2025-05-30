import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./createMongo";
import { ImageProvider } from "./imageProvider";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();
app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/api/images", async (req: Request, res: Response) => {
    try {
        const images = await imageProvider.getAllImagesWithAuthors();
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Handle all valid routes by serving index.html
Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.resolve(STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
