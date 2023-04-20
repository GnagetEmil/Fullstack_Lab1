require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.CONNECTION_URL;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(process.env.PORT, () => console.log('Example app is listening on port 3000.'));

app.get('/api/albums', async (req, res) => {
    const albumsData = await getAllAlbums();
    res.send(albumsData);
});

app.get('/api/albums/:title', async (req, res) => {
    const title = req.params.title;
    const albumData = await getAlbumByTitle(title);
    if (albumData) {
        res.send(albumData);
    } else {
        res.status(404).send("Album not found");
    }
});

app.post('/api/albums', async (req, res) => {
    const { title, artist, year } = req.body;
    console.log(title, artist, year);

    if (await isAlbumInDatabase(title, artist, year)) {
        const message = 'Status: 409 Album already exists';
        return res.status(409).json({ message });
    }
    else {
        addAlbumToDatabase(title, artist, year)
        const message = 'Status: 201 Album has been added to database';
        return res.status(201).json({ message });
    }
});

app.delete('/api/albums/:id', async (req, res) => {
    const id = req.body
    if (isAlbumInDatabase(id)) {
        deleteAlbumFromDatabase(id)
        const message = 'Album has been deleted from database';
        return res.status(201).json({ message });
    }
    else {
        const message = 'Status: 404 Album does not exist in database';
        return res.status(404).json({ message });
    }

})

app.put('/api/albums/:id', async (req, res) => {
    const album = req.body;
    const id = req.body.id
    console.log(album);

    try {
        await client.connect();
        const idToChange = { _id: new ObjectId(id) };
        const newDocument = { $set: album };
        const result = await client
            .db('MusicAlbums')
            .collection('Albums')
            .updateOne(idToChange, newDocument);
        res.json({ message: 'Album updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update album' });
    } finally {
        await client.close();
    }
})

async function getAllAlbums() {
    try {
        await client.connect();
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

async function isAlbumInDatabase(title, artist, year) {
    try {
        await client.connect();
        const query = {
            title: title,
            artist_name: artist,
            year: year
        };
        const albumData = await client.db("MusicAlbums").collection("Albums").find(query).toArray();
        if (albumData.length == 0) {
            return false;
        }
        else if (albumData.length >= 1) {
            return true;
        }
    }
    catch (error) {
        console.log(error)
    }
}

async function deleteAlbumFromDatabase(id) {
    console.log(id)
    try {
        await client.connect();
        const query = { _id: new ObjectId(id) };
        const result = await client.db("MusicAlbums").collection("Albums").deleteOne(query);

        if (result.deletedCount === 1) {
            console.log("Successfully deleted the document with the specified ID.");
        } else {
            console.log("No document found with the specified ID.");
        }
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}

async function addAlbumToDatabase(title, artist, year) {
    try {
        const database = client.db("MusicAlbums");
        const albums = database.collection("Albums");
        const doc = {
            title: title,
            artist_name: artist,
            year: year
        }
        const result = await albums.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);

    } finally {
        await client.close();
    }
}

