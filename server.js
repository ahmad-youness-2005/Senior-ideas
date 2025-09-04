const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3002; // Different port from admin panel

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://admin:Ahmad2005Younes123@seniroldeas.01cnqvk.mongodb.net/?retryWrites=true&w=majority&appName=SeniroIdeas';
const DB_NAME = 'senior_ideas_db';
const COLLECTIONS = {
    IDEAS: 'ideas',
    USERS: 'users'
};

let client = null;
let db = null;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        if (!client) {
            client = new MongoClient(MONGODB_URI);
            await client.connect();
            console.log('Form server: Connected to MongoDB Atlas');
        }
        
        if (!db) {
            db = client.db(DB_NAME);
        }
        
        return { client, db };
    } catch (error) {
        console.error('Form server: Error connecting to MongoDB:', error);
        throw error;
    }
}

// Get database instance
async function getDatabase() {
    if (!db) {
        await connectToMongoDB();
    }
    return db;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connect to MongoDB on startup
connectToMongoDB().catch(console.error);

// Routes

// Get all ideas
app.get('/api/ideas', async (req, res) => {
    try {
        const db = await getDatabase();
        const ideas = await db.collection(COLLECTIONS.IDEAS).find({}).toArray();
        res.json(ideas);
    } catch (error) {
        console.error('Form server: Error fetching ideas:', error);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

// Add new idea
app.post('/api/ideas', async (req, res) => {
    try {
        const db = await getDatabase();
        const idea = {
            ...req.body,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        const result = await db.collection(COLLECTIONS.IDEAS).insertOne(idea);
        console.log('Form server: New idea submitted:', idea.title);
        res.json({ id: result.insertedId, ...idea });
    } catch (error) {
        console.error('Form server: Error adding idea:', error);
        res.status(500).json({ error: 'Failed to add idea' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const db = await getDatabase();
        const users = await db.collection(COLLECTIONS.USERS).find({}).toArray();
        res.json(users);
    } catch (error) {
        console.error('Form server: Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Add new user
app.post('/api/users', async (req, res) => {
    try {
        const db = await getDatabase();
        const user = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const result = await db.collection(COLLECTIONS.USERS).insertOne(user);
        console.log('Form server: New user registered:', user.email);
        res.json({ id: result.insertedId, ...user });
    } catch (error) {
        console.error('Form server: Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

// Serve the main form website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Form server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
