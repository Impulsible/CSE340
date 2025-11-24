const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")

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
 *  WITH SERVER-SIDE VALIDATION
 * ***************************** */
router.post(
  "/register",
  accountValidate.registationRules(),   // 🔥 MUST MATCH THE MISSPELLED NAME
  accountValidate.checkRegData,         // 🔥 checks data BEFORE controller
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
