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
    const usersCollection = moviesDB.collection("users");

    //get users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    //post users
    app.post("/users", async (req, res) => {
      const newUsers = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already exits" });
      } else {
        const result = await usersCollection.insertOne(newUsers);
        res.send(result);
      }
    });

    //get movies
    app.get("/movies", async (req, res) => {
      try {
        const { genres, minRating, maxRating } = req.query;

        const query = {};
        if (genres) {
          const genreArray = genres.split(",");
          query.genre = { $in: genreArray };
        }

        if (minRating || maxRating) {
          query.rating = {};
          if (minRating) query.rating.$gte = Number(minRating);
          if (maxRating) query.rating.$lte = Number(maxRating);
        }

        const movies = await myCollection
          .find(query)
          .sort({ releaseYear: 1 })
          .toArray();
        res.send(movies);
      } catch (error) {
        res.status(500).send({ message: "Error fetching movies", error });
      }
    });

    // get My Collection
    app.get("/myCollection", async (req, res) => {
      const email = req.query.addedBy;
      const query = {};
      if (email) {
        query.addedBy = email;
      }

      const cursor = myCollection.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    // get single movies
    app.get("/movies/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const movie = await myCollection.findOne(query);
      res.send(movie);
    });

    // get top rated movie
    app.get("/topMovies", async (req, res) => {
      const cursor = myCollection.find().sort({ rating: -1 }).limit(5);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    // get action movie
    app.get("/actionMovies", async (req, res) => {
      const cursor = myCollection.find({ genre: "Action" });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    // get drama movie
    app.get("/dramaMovies", async (req, res) => {
      const cursor = myCollection.find({ genre: "Drama" });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    // get adventure movie
    app.get("/adventureMovies", async (req, res) => {
      const cursor = myCollection.find({ genre: "Adventure" });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    // get latest movie
    app.get("/latestMovie", async (req, res) => {
      const cursor = myCollection.find().sort({ created_at: -1 }).limit(6);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    //post movies
    app.post("/movies", async (req, res) => {
      const newMovies = req.body;
      const result = await myCollection.insertOne(newMovies);
      res.send(result);
    });

    //get update movie
    app.get("/movies/update/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const movie = await myCollection.findOne(query);
      res.send(movie);
    });

    //update movies
    app.patch("/movies/update/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const updatedMovie = req.body;

      const update = {
        $set: {
          title: updatedMovie.title,
          genre: updatedMovie.genre,
          releaseYear: updatedMovie.releaseYear,
          director: updatedMovie.director,
          cast: updatedMovie.cast,
          rating: updatedMovie.rating,
          duration: updatedMovie.duration,
          posterUrl: updatedMovie.posterUrl,
          language: updatedMovie.language,
          country: updatedMovie.country,
          plotSummary: updatedMovie.plotSummary,
          created_at: updatedMovie.created_at,
          addedBy: updatedMovie.addedBy,
        },
      };

      const result = await myCollection.updateOne(query, update);
      res.send(result);
    });

    //delete movies
    app.delete("/movies/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const deleteResult = await myCollection.deleteOne(query);
      res.send(deleteResult);
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
