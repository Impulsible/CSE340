const express = require("express");
const router = express.Router();
const baseController = require("../controllers/baseController");

// Home route
router.get("/", baseController.buildHome);

// Other static routes
router.get("/", function (req, res) {
  res.render("index", { title: "Home | CSE Motors" });
});

// Add these routes if they don't exist
router.get("/custom", function (req, res) {
  res.render("custom", { title: "Custom Shop - All Vehicles | CSE Motors" });
});

router.get("/sedan", function (req, res) {
  res.render("sedan", { title: "Sedans | CSE Motors" });
});

router.get("/suv", function (req, res) {
  res.render("suv", { title: "SUVs | CSE Motors" });
});

router.get("/sport", function (req, res) {
  res.render("sport", { title: "Sport Cars | CSE Motors" });
});

router.get("/truck", function (req, res) {
  res.render("truck", { title: "Trucks | CSE Motors" });
});

router.get("/account", function (req, res) {
  res.render("account", { title: "My Account | CSE Motors" });
});

module.exports = router;