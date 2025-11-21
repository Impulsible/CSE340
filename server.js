/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

// Suppress deprecation warnings
process.removeAllListeners('warning');

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const app = express();

// Session requires
const session = require("express-session");

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware - Using Memory Store
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-key-12345",
  resave: false,
  saveUninitialized: true,
  name: 'sessionId',
  store: new session.MemoryStore() // Using memory instead of PostgreSQL
}));

// Flash Message Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
  // Get all flash messages and make available to templates
  res.locals.flashMessages = req.flash();
  next();
});

app.set("view engine", "ejs");
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use("/", require("./routes/static"));
app.use("/inv", require("./routes/inventoryRoute"));

// Test route to verify flash messages work
app.get("/test-flash", (req, res) => {
  req.flash("success", "Flash messages are working!");
  req.flash("notice", "This is a test notice message.");
  res.redirect("/");
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`🚗 CSE Motors running on port ${port}`);
  console.log(`Home page: http://localhost:${port}/`);
  console.log(`Test flash: http://localhost:${port}/test-flash`);
});