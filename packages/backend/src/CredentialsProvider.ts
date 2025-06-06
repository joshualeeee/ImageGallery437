import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        const exists = await this.collection.findOne({'username' : username });
        // if user already exists, return false
        if (exists) {
            return false;
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plaintextPassword, salt);
        // console.log(`salt: ${salt}`);
        // console.log(`hash: ${hash}`);

        // Define user object
        const newUser = {
            username: username,
            password: hash, 
            createdAt: new Date()
        };

        // Insert the user
        const result = await this.collection.insertOne(newUser);
        console.log("User created with ID:", result.insertedId);

        // Wait for any DB operations to finish before returning!
        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        // TODO
        const user = await this.collection.findOne(
            { username: username },
            { projection: { password: 1, _id: 0 } } // Exclude _id and return only password
        );
        if (!user) {
            console.log('User not found.');
            return false;
        }
        const hashedDatabasePassword = user.password;
        const match = await bcrypt.compare(plaintextPassword, hashedDatabasePassword);
        
        if (match) {
            console.log('Password is correct!');
        } else {
            console.log('Wrong pass');
        }
        return match;
    }
}
