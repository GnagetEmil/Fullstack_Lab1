require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.CONNECTION_URL;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// Get index.html
// sendFile will go here
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(process.env.PORT, () => console.log('Example app is listening on port 3000.'));


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);


