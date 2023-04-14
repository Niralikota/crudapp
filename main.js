//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')

const app = express();
const PORT = process.env.PORT || 5000;

//database connection
mongoose.connect('mongodb://127.0.0.1:27017/node_crudapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to database');
}).catch((err) => {
  console.error('Error connecting to database:', err);
});

app.use(express.static("uploads"))



//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: "my secret key",
  saveUninitialized: true,
  resave: false,
}));

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

//set template engine
app.set("view engine", "ejs");

//route prefix
app.use("", require("./routes/routes"))

app.listen(PORT, () => {
  console.log(`server listen at http://localhost:${PORT}`)
});
