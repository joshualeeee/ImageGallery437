import { MongoClient, Collection, ObjectId, Filter } from "mongodb";
import { IApiImageData, IApiUserData } from "./common/ApiImageData";

interface IImageDocument {
    _id?: ObjectId;
    src: string;
    name: string;
    authorId: ObjectId;  // Reference to user document
    createdAt: Date;
    updatedAt: Date;
}

interface IUserDocument {
    _id: ObjectId;
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

    async getAllImagesWithAuthors(searchQuery?: string): Promise<IApiImageData[]> {
        // Build the query filter
        const filter = searchQuery 
            ? { name: { $regex: searchQuery, $options: 'i' } }  // Case-insensitive search
            : {};
        
        // First, get all images matching the filter
        const images = await this.imageCollection.find(filter).toArray();
        
        // Get all unique author IDs from the images
        const authorIds = [...new Set(images.map(img => img.authorId))];
        
        // Fetch all authors in one query
        const authors = await this.userCollection.find({
            _id: { $in: authorIds }
        }).toArray();
        
        // Create a map for quick author lookup
        const authorMap = new Map(authors.map(author => [author._id.toString(), author]));
        
        // Combine the data
        return images.map(image => ({
            id: image._id?.toString() || '',
            src: image.src,
            name: image.name,
            author: {
                id: image.authorId.toString(),
                username: authorMap.get(image.authorId.toString())?.username || 'Unknown'
            }
        }));
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const filter: Filter<IImageDocument> = { _id: new ObjectId(imageId) };
        const result = await this.imageCollection.updateOne(
            filter,
            { 
                $set: { 
                    name: newName,
                    updatedAt: new Date()
                }
            }
        );
        return result.matchedCount;
    }
}