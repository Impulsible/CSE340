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
 * Additional Routes
 *************************/
app.get("/custom", (req, res) => {
  res.render("custom", { title: "Custom Shop | CSE Motors" });
});

app.get("/sedan", (req, res) => {
  res.render("sedan", { title: "Sedan | CSE Motors" });
});

app.get("/suv", (req, res) => {
  res.render("suv", { title: "SUV | CSE Motors" });
});

app.get("/truck", (req, res) => {
  res.render("truck", { title: "Truck | CSE Motors" });
});

app.get("/account", (req, res) => {
  res.render("account", { title: "My Account | CSE Motors" });
});

/* ***********************
 * 404 Handler - Catch All
 *************************/
app.use((req, res) => {
  res.status(404).render("404", { 
    title: "Page Not Found | CSE Motors",
    url: req.originalUrl
  });
});

/* ***********************
 * 500 Error Handler
 *************************/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { 
    title: "Server Error | CSE Motors",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
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
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});