const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
})
let exerciseUsers = mongoose.model('exerciseUserSchema', exerciseUserSchema);

const exerciseTrackSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true }
});
let exerciseTracks = mongoose.model('exerciseTrackSchema', exerciseTrackSchema);

// error message
const USERNAME_EMPTY = "no username";
const USERNAME_EXSIT = "username already exists";
const EXERCISE_PARAM_ERROR = "parameters type not correct!!"

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const isValidDateFormat = (dateStr) => {
  return /^(\d{4})-(\d{1,2})-(\d{1,2})$/.test(dateStr)
}

app.post("/api/users", (req, res) => {
  if (req.body.username === "") {
    return res.json({ error: USERNAME_EMPTY });
  }

  const username = req.body.username;
  exerciseUsers.findOne({ username: username })
    .then((data) => {
      if (!data) {
        console.log(username + " to create");
        const newUser = new exerciseUsers({ username: username });
        newUser.save()
          .then((data) => {
            res.json({ username: username, _id: data._id.toString() });
          })
          .catch((err) => {
            console.log(err)
          });
      } else {
        console.log(username + " exists");
        res.json({ error: USERNAME_EXSIT });
      }
    }).catch((err) => {
      return res.json({ error: "something error: " + err });
    });
})

app.get("/api/users", (req, res) => {
  exerciseUsers.find()
    .select({ "username": 1, "_id": 1 })
    .then((data) => {
      return res.json(data)
    }).catch((err) => {
      return res.json({ error: "something error: " + err })
    });
})

app.post("/api/users/:_id/exercises", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
    console.log(EXERCISE_PARAM_ERROR, " userID = ", req.params._id)
    return res.json({
      error: EXERCISE_PARAM_ERROR,
      param: req.params._id
    });
  }
  const userID = new mongoose.Types.ObjectId(req.params._id);
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = (req.body.date === undefined || req.body.date === "") ? new Date() :
    (isValidDateFormat(req.body.date)) ?
      new Date(req.body.date) : new Date(NaN);

  //console.log(userID, description, duration, date);

  if (isNaN(duration)) {
    console.log(EXERCISE_PARAM_ERROR, " duration = ", req.body.duration)
    return res.json({
      error: EXERCISE_PARAM_ERROR,
      param: req.body.date
    });
  } else if (date.toString() === "Invalid Date") {
    console.log(EXERCISE_PARAM_ERROR, " date = ", req.body.date)
    return res.json({
      error: EXERCISE_PARAM_ERROR,
      param: req.body.date
    });
  } else if (description === "") {
    console.log(EXERCISE_PARAM_ERROR, " description empty")
    return res.json({
      error: EXERCISE_PARAM_ERROR,
      param: req.body.description
    });
  }

  exerciseUsers.findOne({ _id: userID })
    .then((userInfo) => {
      const newTrack = new exerciseTracks({
        userID: userID.toString(),
        description: description,
        duration: duration,
        date: date
      });
      newTrack.save()
        .then((data) => {
          return res.json({
            username: userInfo["username"],
            description: description,
            duration: duration,
            date: date.toDateString(),
            _id: userID.toString()
          })
        }).catch((err) => {
          console.log("something error: ", err);
          return res.json({ error: err });
        });
    })
    .catch((err) => {
      console.log("error: ", err);
      res.json({ error: "hello world!!" });
    });
})

app.get("/api/users/:_id/logs", (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
    console.log(EXERCISE_PARAM_ERROR, " userID = ", req.params._id)
    return res.json({
      error: EXERCISE_PARAM_ERROR,
      param: req.params._id
    });
  }
  const userID = new mongoose.Types.ObjectId(req.params._id);

  let findTrackConditions = { userID: userID.toString() };
  // isValidDateFormat
  if (req.query.from !== undefined && isValidDateFormat(req.query.from)) {
    if (!findTrackConditions.hasOwnProperty("date"))
      findTrackConditions["date"] = {};

    findTrackConditions["date"].$gte = new Date(req.query.from)
  }
  if (req.query.to !== undefined && isValidDateFormat(req.query.to)) {
    if (!findTrackConditions.hasOwnProperty("date"))
      findTrackConditions["date"] = {};

    findTrackConditions["date"].$lte = new Date(req.query.to)
  }
  //console.log(findTrackConditions)

  let limitData = 0;
  if (req.query.limit !== undefined) {
    if (!isNaN(parseInt(req.query.limit))) {
      limitData = parseInt(req.query.limit);
    }
  }

  exerciseUsers.findOne({ _id: userID })
    .then((userInfo) => {
      exerciseTracks.find(findTrackConditions)
        .sort({ "date": "asc" })
        .limit(limitData)
        .then((tracks) => {
          let output = {};
          output["username"] = userInfo["username"];
          output["count"] = tracks.length;
          output["_id"] = userID.toString();
          output["log"] = tracks.map((item) => {
            return {
              description: item.description,
              duration: item.duration,
              date: item.date.toDateString()
            }
          });
          return res.json(output)
        });
    });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
