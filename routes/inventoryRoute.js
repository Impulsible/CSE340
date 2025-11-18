const express = require("express");
const router = express.Router();
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

/* ***************************
 *  Home Page Route
 * ************************** */
router.get("/", async (req, res, next) => {
  try {
    // Get data for the navigation
    const classifications = await invModel.getClassifications();
    const featuredInventory = await invModel.getFeaturedInventory();
    
    let nav;
    try {
      nav = await utilities.getNav();
    } catch {
      nav = '<nav>Navigation</nav>'; // Fallback
    }
    
    res.render("index", {
      title: "CSE Motors",
      nav,
      classifications: classifications.rows || classifications,
      featuredInventory: featuredInventory || []
    });
  } catch (error) {
    console.error("Home route error:", error);
    next(error);
  }
});

module.exports = router;