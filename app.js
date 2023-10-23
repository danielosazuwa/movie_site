import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import _ from "lodash";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const APIKey = "api_key=ed7c4374cf9628a19e0132636e35c40b";
app.get("/", async (req, res) => {
  try {
    const randomNum = Math.floor(Math.random() * (200 - 0 + 1) + 0);

    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/popular?sort_by=popularity.desc&" +
        APIKey +
        "&page=" +
        randomNum
    );

    const result = response.data;
    const all = await axios.get(
      "https://api.themoviedb.org/3/trending/all/week?" + APIKey
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
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.get("/movie/:movieName", async (req, res) => {
  try {
    const requestedmovieName = _.lowerCase(req.params.movieName);
    console.log(requestedmovieName);
    const movieDetails = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=ed7c4374cf9628a19e0132636e35c40b`
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
