/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static");

/* ***********************
 * Static Files Middleware
 * Serves files from /public for CSS, JS, images, etc.
 *************************/
app.use(express.static("public"));

/* *******************************
 * View Engine and Templates
 ******************************** */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // relative to /views

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);

/* ***********************
 * Index route
 *************************/
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`🚗 CSE Motors running at http://${host}:${port}`);
});
