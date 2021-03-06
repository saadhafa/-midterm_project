"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const cookieSession = require('cookie-session');
var twilio = require('twilio');


// Seperated Routes for each Resource
const loginRoute = require('./routes/login_route');
const registerRoute = require('./routes/register_route');
const restaurantsRoute = require('./routes/restaurants_route');
const orderStatusRoute = require('./routes/order_status_route');
const orderHistoryRoute = require('./routes/order_history_route');

const orderRoute = require("./routes/order_route");
// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
//app.use("/api/users", usersRoutes(knex));


// Home page

app.use("/", loginRoute(knex));
app.use("/register", registerRoute(knex));
app.use("/restaurants", restaurantsRoute(knex));
app.use("/orders", orderStatusRoute(knex));
app.use("/restaurant", orderRoute(knex));
app.use("/history", orderHistoryRoute(knex));


// logout route
app.get('/logout', (req,res) => {
  req.session = null;
  res.redirect('/')
});



app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
