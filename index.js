const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

// CineVerse
// ivC2PIsv18ztdtAs

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nmjlal4.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function run() {
  try {
    const moviesDB = client.db("movieDB");
    const myCollection = moviesDB.collection("movieMenu");

    //get movies
    app.get("/movies", async (req, res) => {
      const cursor = myCollection.find();
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    //post movies
    app.post("/movies", async (req, res) => {
      const newMovies = req.body;
      const result = await myCollection.insertOne(newMovies);
      res.send(result)
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
