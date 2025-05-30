import { MongoClient, Collection } from "mongodb";
import { IApiImageData, IApiUserData } from "./common/ApiImageData";

interface IImageDocument {
    _id?: string;
    src: string;
    name: string;
    authorId: string;  // Reference to user document
    createdAt: Date;
    updatedAt: Date;
}

interface IUserDocument {
    _id: string;
    username: string;
}

export class ImageProvider {
    private imageCollection: Collection<IImageDocument>;
    private userCollection: Collection<IUserDocument>;

    constructor(private readonly mongoClient: MongoClient) {
        const imageCollectionName = process.env.IMAGES_COLLECTION_NAME;
        const userCollectionName = process.env.USERS_COLLECTION_NAME;
        
        if (!imageCollectionName || !userCollectionName) {
            throw new Error("Missing collection names from environment variables");
        }
        
        this.imageCollection = this.mongoClient.db().collection(imageCollectionName);
        this.userCollection = this.mongoClient.db().collection(userCollectionName);
    }

    async getAllImagesWithAuthors(): Promise<IApiImageData[]> {
        // First, get all images
        const images = await this.imageCollection.find().toArray();
        
        // Get all unique author IDs from the images
        const authorIds = [...new Set(images.map(img => img.authorId))];
        
        // Fetch all authors in one query
        const authors = await this.userCollection.find({
            _id: { $in: authorIds }
        }).toArray();
        
        // Create a map for quick author lookup
        const authorMap = new Map(authors.map(author => [author._id, author]));
        
        // Combine the data
        return images.map(image => ({
            id: image._id || '',
            src: image.src,
            name: image.name,
            author: {
                id: image.authorId,
                username: authorMap.get(image.authorId)?.username || 'Unknown'
            }
        }));
    }
}