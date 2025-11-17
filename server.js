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

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use("/", require("./routes/static"));
app.use("/inv", require("./routes/inventoryRoute"));

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

// TRIGGER ERROR ROUTE - Add this here
app.get("/trigger-error", (req, res, next) => {
  console.log("Trigger error route accessed!");
  const error = new Error("Intentional 500 error for CSE 340 Assignment 3 testing");
  error.status = 500;
  next(error);
});

/* ***********************
 * Error Handlers
 *************************/

// 404 Handler - MUST BE LAST
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found | CSE Motors</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #dc3545; }
        a { color: #007bff; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page "${req.originalUrl}" could not be found.</p>
      <a href="/">Return to Home</a>
    </body>
    </html>
  `);
});

// Add this with your other routes
app.get("/test-vehicles", (req, res) => {
  res.render("test-vehicles", { title: "Test Vehicles | CSE Motors" });
});

// 500 Error Handler - MUST BE AFTER 404
app.use((err, req, res, next) => {
  console.error('🔥 500 Error:', err.message);
  
  res.status(err.status || 500).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>500 - Server Error | CSE Motors</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #dc3545; }
        a { color: #007bff; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>500 - Server Error</h1>
      <p>${err.message}</p>
      <a href="/">Return to Home</a>
    </body>
    </html>
  `);
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`🚗 CSE Motors running at http://${host}:${port}`);
  console.log(`Try these test URLs:`);
  console.log(`  Home: http://${host}:${port}/`);
  console.log(`  Trigger Error: http://${host}:${port}/trigger-error`);
  console.log(`  Test Vehicle: http://${host}:${port}/inv/detail/1`);
  console.log(`  Test 404: http://${host}:${port}/fake-page`);
});