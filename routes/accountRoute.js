const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const { AccountController } = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")
const { requireAuth } = require("../middleware/jwtMiddleware")
const favoriteRoutes = require("./favoriteRoute") // ADD THIS LINE

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
  accountValidate.registationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(AccountController.registerAccount)
)

/* *****************************
 *  GET route for account dashboard
 * ***************************** */
router.get(
  "/dashboard",
  requireAuth,
  utilities.handleErrors(AccountController.buildDashboard)
)

/* *****************************
 *  GET route for account update view WITH account_id parameter
 * ***************************** */
router.get(
  "/update/:account_id",
  requireAuth,
  utilities.handleErrors(AccountController.buildUpdateView)
)

/* *****************************
 *  POST route to process account update
 * ***************************** */
router.post(
  "/update",
  requireAuth,
  accountValidate.updateRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(AccountController.updateAccount)
)

/* *****************************
 *  POST route to process password change (TASK 5)
 * ***************************** */
router.post(
  "/update-password",
  requireAuth,
  accountValidate.passwordChangeRules(),
  accountValidate.checkPasswordChangeData,
  utilities.handleErrors(AccountController.updatePassword)
)

/* *****************************
 *  GET route for logout (TASK 6)
 * ***************************** */
router.get(
  "/logout",
  utilities.handleErrors(AccountController.logout)
)

/* *****************************
 *  FAVORITE VEHICLES ROUTES
 * ***************************** */
router.use("/favorites", favoriteRoutes) // ADD THIS LINE

// CRITICAL: Export the router, not an object
module.exports = router