require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

const bodyParser = require("body-parser");

//POST body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

const urlDictionary = {};

//First key for the object item, will keep incrementing later
let count = 1;

const dns = require("dns");

app.post("/api/shorturl", async (req, res) => {
  let url = req.body.url;

  // Prepend https:// if the URL doesn't start with http:// or https://
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const hostname = new URL(url).hostname;

    dns.lookup(hostname, (error, address) => {
      if (error) {
        res.json({ error: "invalid url" });
      } else {
        urlDictionary[count] = url;
        count += 1;

        res.json({ original_url: url, short_url: count - 1 });
      }
    });
  } catch (error) {
    // This will catch any errors from the URL constructor
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:urlid", (req, res) => {
  try {
    const urlid = req.params.urlid;

    res.redirect(urlDictionary[urlid]);
  } catch (error) {
    throw error;
  }
});
