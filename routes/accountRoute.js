const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const { AccountController } = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")
const { requireAuth } = require("../middleware/jwtMiddleware")

// GET login view
router.get(
  "/login",
  utilities.handleErrors(AccountController.buildLogin)
)

// POST login with validation and JWT authentication
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(AccountController.loginAccount)
)

/* *****************************
 *  GET route for registration view
 * ***************************** */
router.get(
  "/register",
  utilities.handleErrors(AccountController.buildRegister)
)

/* *****************************
 *  POST route to process registration
 *  WITH SERVER-SIDE VALIDATION
 * ***************************** */
router.post(
  "/register",
  accountValidate.registationRules(),   // 🔥 MUST MATCH THE MISSPELLED NAME
  accountValidate.checkRegData,         // 🔥 checks data BEFORE controller
  utilities.handleErrors(AccountController.registerAccount)
)

/* *****************************
 *  GET route for account dashboard
 * ***************************** */
router.get(
  "/dashboard",
  requireAuth, // Protect this route - requires login
  utilities.handleErrors(AccountController.buildDashboard)
)

/* *****************************
 *  GET route for account update view
 * ***************************** */
router.get(
  "/update",
  requireAuth, // Protect this route - requires login
  utilities.handleErrors(AccountController.buildUpdateView)
)

/* *****************************
 *  POST route to process account update
 * ***************************** */
router.post(
  "/update",
  requireAuth, // Protect this route - requires login
  accountValidate.updateRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(AccountController.updateAccount)
)

/* *****************************
 *  GET route for logout
 * ***************************** */
router.get(
  "/logout",
  utilities.handleErrors(AccountController.logout)
)

module.exports = router