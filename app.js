//require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
//const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Import MongoDB Atlas URI
const uri = require("./atlas_uri");
console.log("MongoDB URI:", uri);

// Create MongoDB Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "MSU";

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("MongoDB connection error:", e);
        process.exit(1);
    }
}

// Connect to DB before handling requests
connectToDatabase();

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Route: Fetch Student Document and Send to Frontend
app.get('/student', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection("students");

        const query = { Program: "BCA" }; // Example query
        const student = await collection.findOne(query, { projection: { _id: 0, id: 1, name: 1, Program: 1 } });

        if (!student) return res.status(404).json({ message: "No student found" });

        res.json(student); // Send data as JSON
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Default Route (Serve Frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
