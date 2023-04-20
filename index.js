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

app.get('/api/albums', async (req, res) => {
    console.log(await getAllAlbums())
    const albumsData = await getAllAlbums();
    res.send(albumsData);
})

app.get('/api/albums/:title', async (req, res) => {
    const title = req.params.title;
    const albumData = await getAlbumByTitle(title);
    if (albumData) {
        res.send(albumData);
    } else {
        res.status(404).send("Album not found");
    }
});


async function getAllAlbums() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const cursor = client.db("MusicAlbums").collection("Albums").find();
        const results = await cursor.toArray();

        return (JSON.stringify(results));
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

async function getAlbumByTitle(title) {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const query = { title: title };
        const albumData = await client.db("MusicAlbums").collection("Albums").find(query).toArray();

        if (albumData.length === 0) {
            return null;
        } else if (albumData.length === 1) {
            return albumData[0];
        } else {
            return albumData;
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}









