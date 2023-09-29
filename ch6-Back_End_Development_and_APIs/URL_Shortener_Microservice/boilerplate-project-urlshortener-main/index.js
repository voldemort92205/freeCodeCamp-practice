require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const app = express();
const md5 = require('md5');

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const shortURLSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true }
})
let urlCollect = mongoose.model('URL', shortURLSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const getID = (urlStr) => {
  newID = parseInt(md5(urlStr).substring(0, 10), 16);
  return newID;
}

app.post("/api/shorturl", function(req, res) {
  //console.log("in post function")
  //console.log(urlParser.parse(req.body.url).hostname)
  //console.log(req.body.url)
  dns.lookup(urlParser.parse(req.body.url).hostname, (err, address) => {
    //console.log("err: ", err)
    //console.log("address: ", address)
    if (err || !address) {
      res.json({ error: 'invalid url' });
    } else {
      urlCollect.findOne({ original_url: req.body.url })
        .then((data) => {
          if (!data) {
            // no data
            //console.log("not in database...")
            const short_url = getID(req.body.url);
            original_url = req.body.url;
            const newURL = new urlCollect({
              original_url: original_url,
              short_url: short_url
            });
            newURL.save()
              .catch((err) => {
                console.log(err)
                //else console.log(data)
              });
            res.json({
              original_url: original_url,
              short_url: short_url
            });
          } else {
            res.json({
              original_url: data.original_url,
              short_url: data.short_url
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({ error: "something error: " + err });
        });
    }
  });
})


app.get("/api/shorturl/:short_url?", (req, res) => {
  if (req.params.short_url === undefined) {
    res.json({ error: 'invalid url' });
  } else {
    urlCollect.findOne({ short_url: req.params.short_url })
      .then((data) => {
        if (!data) {
          // no data
          res.json({ error: "no such shortURL: " + req.params.short_url })
        } else {
          /*
          res.json({
            original_url: data.original_url,
            short_url: data.short_url
          });
          */
          res.redirect(data.original_url);
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({ error: "something error" });
      });
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
