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

    async updateImageName(imageId: string, newName: string, username: string): Promise<number> {
        // First get the image to check ownership
        const image = await this.imageCollection.findOne({ _id: new ObjectId(imageId) });
        if (!image) {
            return 0; // Image not found
        }

        // Get the author's username
        const author = await this.userCollection.findOne({ _id: image.authorId });
        if (!author || author.username !== username) {
            return -1; // Not authorized
        }

        // If authorized, update the name
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

    async createImage(
        src: string,
        name: string,
        author: string
    ): Promise<void> {
        try {
            console.log("Creating image document:", { src, name, author });
            
            // First get the user's ID from their username
            console.log("Looking up user in collection:", this.userCollection.collectionName);
            const user = await this.userCollection.findOne({ username: author });
            console.log("User lookup result:", user);
            
            if (!user) {
                console.error("User not found:", author);
                throw new Error(`User not found: ${author}`);
            }

            console.log("Found user:", { userId: user._id, username: user.username });

            const now = new Date();
            const imageDoc: IImageDocument = {
                src,
                name,
                authorId: user._id,
                createdAt: now,
                updatedAt: now
            };

            console.log("Inserting image document:", imageDoc);
            const result = await this.imageCollection.insertOne(imageDoc);
            console.log("Image document inserted:", result.insertedId);
        } catch (error) {
            console.error("Error in createImage:", error);
            throw error; // Re-throw to be handled by the route
        }
    }
}