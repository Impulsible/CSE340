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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  res.render("custom", { title: "Custom Shop - All Vehicles | CSE Motors" });
});

app.get("/sedan", (req, res) => {
  res.render("sedan", { title: "Sedans | CSE Motors" });
});

app.get("/suv", (req, res) => {
  res.render("suv", { title: "SUVs | CSE Motors" });
});

app.get("/sport", (req, res) => {
  res.render("sport", { title: "Sport Cars | CSE Motors" });
});

app.get("/truck", (req, res) => {
  res.render("truck", { title: "Trucks | CSE Motors" });
});

app.get("/account", (req, res) => {
  res.render("account", { title: "My Account | CSE Motors" });
});

// DEBUG ROUTES - ADD THESE
app.get('/debug-db', async (req, res) => {
  try {
    const pool = require('./database/');
    
    // Test classifications
    const classifications = await pool.query('SELECT * FROM classification');
    
    // Test inventory
    const inventory = await pool.query('SELECT * FROM inventory');
    
    // Test specific vehicle with ID 1
    const vehicle1 = await pool.query('SELECT * FROM inventory WHERE inv_id = 1');
    
    res.json({
      database_status: 'Connected',
      classifications_count: classifications.rows.length,
      inventory_count: inventory.rows.length,
      vehicle_1_exists: vehicle1.rows.length > 0,
      all_classifications: classifications.rows,
      all_inventory: inventory.rows
    });
  } catch (error) {
    res.json({
      database_status: 'ERROR',
      error: error.message
    });
  }
});

app.get('/debug-vehicle/:id', async (req, res) => {
  try {
    const pool = require('./database/');
    const vehicle = await pool.query('SELECT * FROM inventory WHERE inv_id = $1', [req.params.id]);
    
    res.json({
      vehicle_id_requested: req.params.id,
      vehicle_found: vehicle.rows.length > 0,
      vehicle_data: vehicle.rows[0] || 'NOT FOUND'
    });
  } catch (error) {
    res.json({
      error: error.message
    });
  }
});

app.get('/test-vehicle/:id', async (req, res) => {
  try {
    const invModel = require('./models/inventory-model');
    const vehicle = await invModel.getVehicleDetailById(req.params.id);
    res.json({
      vehicleFound: !!vehicle,
      vehicle: vehicle
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/test-vehicles", (req, res) => {
  res.render("test-vehicles", { title: "Test Vehicles | CSE Motors" });
});

/* ***********************
 * Error Handlers - FIXED
 *************************/

// 500 Error Handler - MUST COME BEFORE 404
app.use(async (err, req, res, next) => {
  console.error('🔥 500 Error:', err.message);
  
  let nav = '';
  try {
    // Use a simple fallback navigation instead of utilities.getNav
    nav = `
      <nav class="main-nav" aria-label="Main navigation">
        <ul class="nav-list">
          <li><a href="/">Home</a></li>
          <li><a href="/inv/type/1">Custom Shop</a></li>
          <li><a href="/inv/type/2">Sports Cars</a></li>
          <li><a href="/inv/type/3">SUVs</a></li>
          <li><a href="/inv/type/4">Trucks</a></li>
          <li><a href="/inv/type/5">Sedans</a></li>
          <li><a href="/account">Account</a></li>
        </ul>
      </nav>
    `;
  } catch (e) {
    nav = '<nav><a href="/">Home</a> | <a href="/inv">Inventory</a> | <a href="/account">Account</a></nav>';
  }
  
  res.status(err.status || 500).render("errors/error", {
    title: "500 - Server Error",
    nav: nav,
    message: err.message
  });
});

// 404 Handler - MUST BE LAST
app.use(async (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  
  let nav = '';
  try {
    // Use a simple fallback navigation instead of utilities.getNav
    nav = `
      <nav class="main-nav" aria-label="Main navigation">
        <ul class="nav-list">
          <li><a href="/">Home</a></li>
          <li><a href="/inv/type/1">Custom Shop</a></li>
          <li><a href="/inv/type/2">Sports Cars</a></li>
          <li><a href="/inv/type/3">SUVs</a></li>
          <li><a href="/inv/type/4">Trucks</a></li>
          <li><a href="/inv/type/5">Sedans</a></li>
          <li><a href="/account">Account</a></li>
        </ul>
      </nav>
    `;
  } catch (e) {
    nav = '<nav><a href="/">Home</a> | <a href="/inv">Inventory</a> | <a href="/account">Account</a></nav>';
  }
  
  res.status(404).render("errors/error", {
    title: "404 - Page Not Found",
    nav: nav,
    message: `Sorry, the page "${req.originalUrl}" could not be found.`
  });
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
  console.log(`  Debug DB: http://${host}:${port}/debug-db`);
  console.log(`  Debug Vehicle 1: http://${host}:${port}/debug-vehicle/1`);
  console.log(`  Trigger Error: http://${host}:${port}/trigger-error`);
  console.log(`  Test Vehicle: http://${host}:${port}/inv/detail/1`);
  console.log(`  Test Classification: http://${host}:${port}/inv/type/1`);
  console.log(`  Test 404: http://${host}:${port}/fake-page`);
});