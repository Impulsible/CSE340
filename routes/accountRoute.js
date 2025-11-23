const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// GET login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// POST login (placeholder for future)
router.post("/login", (req, res) => {
  console.log("Login attempt:", req.body)
  req.flash("notice", "Login functionality coming soon!")
  res.redirect("/account/login")
})

/* *****************************
 *  GET route for registration view
 * ***************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

/* *****************************
 *  POST route to process registration
 * ***************************** */
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
