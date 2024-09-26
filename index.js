import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import _ from "lodash";
import dotenv from "dotenv";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: "config.env" });
const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//This is the root route
app.get("/", async (req, res) => {
  try {
    const randomNum = Math.floor(Math.random() * (200 - 0 + 1) + 0);

    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/popular?sort_by=popularity.desc&" +
        process.env.APIKEY +
        "&page=" +
        randomNum
    );

    const result = response.data;
    const all = await axios.get(
      "https://api.themoviedb.org/3/trending/all/week?" + process.env.APIKEY
    );

    // const random = allResult[Math.floor(Math.random() * allResult.length)];

    function getMultipleRandom(allResult, num) {
      const shuffled = [...allResult].sort(() => 0.5 - Math.random());

      return shuffled.slice(0, num);
    }
    const allResult = all.data.results;
    const random = getMultipleRandom(allResult, 5);
    // console.log(getMultipleRandom(allResult, 5));
    // const randomTop = Math.random(Math.floor(topRatedResult.length));
    // const topRatedResult = topRatedRes.data;

    // console.log(result);
    // console.log(random);
    res.render("index.ejs", {
      data: result,
      movies: random,
    });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.send("Error loading page");
  }
});

//This is for the search route
app.post("/search/movie", async (req, res) => {
  try {
    const requestedmovieName = _.lowerCase(req.body.movie);
    // console.log(requestedmovieName);
    const movieDetails = await axios.get(
      "https://api.themoviedb.org/3/search/movie?query=" +
        requestedmovieName +
        "&" +
        process.env.APIKEY
    );
    const details = movieDetails.data.results;
    // console.log(details)
    res.render("movieSingle.ejs", { details });
  } catch (error) {
    console.log(error.message);
  }
});

//This is for the movie details
app.get("/:Id", async (req, res) => {
  try {
    const movieId = req.params.Id;
    console.log(movieId);
    const movieIdDetails = await axios.get(
      "https://api.themoviedb.org/3/movie/" + movieId + "?" + process.env.APIKEY
    );
    const details = movieIdDetails.data;
    console.log(details);
    res.render("movieDetails.ejs", { details });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/:Id", async (req, res) => {
  try {
    const movieId = req.params.Id;
    console.log(movieId);
    const movieIdDetails = await axios.get(
      "https://api.themoviedb.org/3/trending/all/week?" + process.env.APIKEY
    );
    const details = movieIdDetails.data;
    console.log(details);
    res.render("movieDetails.ejs", { details });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/movie/:movieName", async (req, res) => {
  try {
    const requestedmovieName = _.lowerCase(req.params.movieName);
    console.log(requestedmovieName);
    const movieDetails = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?` + process.env.APIKEY
    );
    const details = movieDetails.data.results;
    details.forEach((result) => {
      const storedTitle = _.lowerCase(result.title);
      console.log(storedTitle);
      if (storedTitle === requestedmovieName) {
        res.render("movieSingle.ejs", {
          display: result,
        });
        console.log("Match found!");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});