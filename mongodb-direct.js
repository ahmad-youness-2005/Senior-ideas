// Direct MongoDB connection for client-side (using MongoDB Atlas Data API)
const MONGODB_API_URL = 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1';
const MONGODB_API_KEY = 'YOUR_API_KEY_HERE'; // You'll need to get this from MongoDB Atlas

// Database and collection names
const DB_NAME = 'senior_ideas_db';
const COLLECTIONS = {
    IDEAS: 'ideas',
    USERS: 'users'
};

// MongoDB Atlas Data API functions
class MongoDBClient {
    constructor() {
        this.apiUrl = MONGODB_API_URL;
        this.apiKey = MONGODB_API_KEY;
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKey
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('MongoDB API request failed:', error);
            throw error;
        }
    }

    // Get all ideas
    async getIdeas() {
        const endpoint = `/action/find`;
        const data = {
            collection: COLLECTIONS.IDEAS,
            database: DB_NAME,
            filter: {}
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Add new idea
    async addIdea(idea) {
        const endpoint = `/action/insertOne`;
        const data = {
            collection: COLLECTIONS.IDEAS,
            database: DB_NAME,
            document: {
                ...idea,
                createdAt: new Date().toISOString(),
                status: 'pending'
            }
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Get all users
    async getUsers() {
        const endpoint = `/action/find`;
        const data = {
            collection: COLLECTIONS.USERS,
            database: DB_NAME,
            filter: {}
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Add new user
    async addUser(user) {
        const endpoint = `/action/insertOne`;
        const data = {
            collection: COLLECTIONS.USERS,
            database: DB_NAME,
            document: {
                ...user,
                createdAt: new Date().toISOString()
            }
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }
}

// Create global MongoDB client instance
const mongoClient = new MongoDBClient();

// Export for use in other files
window.MongoDBClient = MongoDBClient;
window.mongoClient = mongoClient;