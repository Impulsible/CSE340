const express = require('express');
const path = require('path');
const router = express.Router();

// Static Routes
// Set up "public" folder / subfolders for static files (relative to project root)
router.use(express.static(path.join(__dirname, '..', 'public')));
router.use("/css", express.static(path.join(__dirname, '..', 'public', 'css')));
router.use("/js", express.static(path.join(__dirname, '..', 'public', 'js')));
router.use("/images", express.static(path.join(__dirname, '..', 'public', 'images')));

// Home page route
router.get("/", (req, res) => {
  res.render("index", { title: "CSE Motors" });
});

// REMOVE THIS - we'll handle it in server.js
// router.get("/trigger-error", (req, res, next) => {
//   const error = new Error("Intentional 500 error for testing");
//   error.status = 500;
//   next(error);
// });

module.exports = router;