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
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;

  console.log('User IP:', ip);  // Log the IP to check

  try {
    const userIp = await axios.get(`http://ip-api.com/json/${ip}`);
    const country = userIp.data.country;

    const randomNum = Math.floor(Math.random() * (200 - 0 + 1) + 0);

    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/popular?sort_by=popularity.desc&" +
        process.env.APIKEY +
        "&page=" +
        randomNum,
      {
        headers: {
          accept: "application/json",
          Authorization: process.env.ACCESSTOKEN,
        },
      }
    );

    const result = response.data;
    const all = await axios.get(
      "https://api.themoviedb.org/3/trending/all/week?" + process.env.APIKEY,
      {
        headers: {
          accept: "application/json",
          Authorization: process.env.ACCESSTOKEN,
        },
      }
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
      ip: ip, country: country
    });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.send("Error loading page");
  }
});

//This is for the search route
app.post("/search/movie", async (req, res) => {
  try {
    const requestedmovieName = req.body.movie.trim();
    // console.log(requestedmovieName);
    // Check if movie name is empty
    if (!requestedmovieName) {
      return res.status(400).send("Please enter a movie name.");
    }
    const movieDetails = await axios.get(
      "https://api.themoviedb.org/3/search/movie?query=" +
        requestedmovieName +
        "&" +
        process.env.APIKEY,
      {
        headers: {
          accept: "application/json",
          Authorization: process.env.ACCESSTOKEN,
        },
      }
    );
    const details = movieDetails.data.results;
    // If no results are found, show a message
    if (!details || details.length === 0) {
      return res.status(404).render("404.ejs");
    }
    // console.log(details)

    res.render("movieSingle.ejs", {
      details,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred while fetching movie data.");
  }
});

//This is for the movie details
app.get("/:Id", async (req, res) => {
  try {
    const movieId = req.params.Id;
    // console.log(movieId);
    const movieIdDetails = await axios.get(
      "https://api.themoviedb.org/3/movie/" +
        movieId +
        "?" +
        process.env.APIKEY,
      {
        headers: {
          accept: "application/json",
          Authorization: process.env.ACCESSTOKEN,
        },
      }
    );
    const details = movieIdDetails.data;
    // console.log(details);

    // const trailerUrl = await axios.get(
    //   `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${details.title}trailer&type=video&${process.env.YOUTUBEKEY}`
    // );

    function convertMinutesToHours(minutes) {
      const hours = Math.floor(minutes / 60); // Get the whole number of hours
      const remainingMinutes = minutes % 60; // Get the remaining minutes
      return `${hours}hr ${remainingMinutes}min`;
    }

    const minutes = details.runtime;
    // console.log(convertMinutesToHours(minutes));
    const runtime = convertMinutesToHours(minutes);

    res.render("movieDetails.ejs", { details, runtime });
  } catch (error) {
    console.log(error.message);
  }
});

// app.get("/:Id", async (req, res) => {
//   try {
//     const movieId = req.params.Id;
//     // console.log(movieId);
//     const movieIdDetails = await axios.get(
//       "https://api.themoviedb.org/3/trending/all/week?" + process.env.APIKEY
//     );
//     const details = movieIdDetails.data;
//     // console.log(details);
//     res.render("movieDetails.ejs", { details });
//   } catch (error) {
//     console.log(error.message);
//   }
// });

app.get("/movie/:movieName", async (req, res) => {
  try {
    const requestedmovieName = _.lowerCase(req.params.movieName);
    console.log(requestedmovieName);
    const movieDetails = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?` + process.env.APIKEY,
      {
        headers: {
          accept: "application/json",
          Authorization: process.env.ACCESSTOKEN,
        },
      }
    );
    const details = movieDetails.data.results;
    details.forEach((result) => {
      const storedTitle = _.lowerCase(result.title);
      // console.log(storedTitle);
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
