import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/popular?api_key=ed7c4374cf9628a19e0132636e35c40b"
    );

    const all = await axios.get(
      "https://api.themoviedb.org/3/trending/all/week?api_key=ed7c4374cf9628a19e0132636e35c40b"
    );
    const allResult = all.data.results;
    const random = allResult[Math.floor(Math.random() * allResult.length)];

    // const randomTop = Math.random(Math.floor(topRatedResult.length));
    // const topRatedResult = topRatedRes.data;
    const result = response.data;
    // console.log(result);
    console.log(random);
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

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
