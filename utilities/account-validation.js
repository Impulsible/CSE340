// utilities/account-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // password is required and must be strong password (Task 5)
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/*  **********************************
 *  Update Account Data Validation Rules (Task 5)
 * ********************************* */
validate.updateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    
    // account_id is required (hidden field)
    body("account_id")
      .notEmpty()
      .isInt()
      .withMessage("Account ID is required."),
  ]
}

/*  **********************************
 *  Change Password Validation Rules (NEW - Task 5)
 *  Updated to match HTML form field names: new_password
 * ********************************* */
validate.passwordChangeRules = () => {
  return [
    // account_id is required (hidden field)
    body("account_id")
      .notEmpty()
      .isInt()
      .withMessage("Account ID is required."),

    // NEW PASSWORD - field name matches HTML: new_password
    body("new_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters with uppercase, lowercase, number, and special character."),

    // CONFIRM PASSWORD - field name matches HTML: confirm_password
    body("confirm_password")
      .trim()
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
      .withMessage("Passwords do not match."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/register", {
      errors: errors.array(),
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash()
    })
  }
  next()
}

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
      messages: req.flash()
    })
  }
  next()
}

/* ******************************
 * Check update data and return errors or continue to update (Task 5)
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    
    // Get fresh account data for the view (TASK 5 requirement)
    const { AccountModel } = require("../models/account-model")
    let accountData = null
    
    if (account_id) {
      try {
        accountData = await AccountModel.findById(account_id)
      } catch (error) {
        console.error('Error fetching account data:', error)
      }
    }
    
    // If no account data from DB, use submitted data
    if (!accountData) {
      accountData = {
        account_id,
        account_firstname,
        account_lastname,
        account_email
      }
    }
    
    // Add user data from JWT if available
    let user = req.user || {}
    
    return res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      user: { ...user, ...accountData }, // Merge JWT and database data
      accountData, // Also pass as separate for compatibility
      messages: req.flash()
    })
  }
  next()
}

/* ******************************
 * Check password data and return errors or continue (NEW - Task 5)
 * Updated function name to match route usage
 * ***************************** */
validate.checkPasswordChangeData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const { account_id } = req.body
    
    // Get account data for the view (TASK 5 requirement)
    const { AccountModel } = require("../models/account-model")
    let accountData = null
    
    if (account_id) {
      try {
        accountData = await AccountModel.findById(account_id)
      } catch (error) {
        console.error('Error fetching account data:', error)
      }
    }
    
    // If no account data from DB, create minimal data
    if (!accountData) {
      accountData = { account_id }
    }
    
    // Add user data from JWT if available
    let user = req.user || {}
    
    return res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      user: { ...user, ...accountData },
      accountData,
      messages: req.flash(),
      passwordErrors: true // Flag to show password form had errors
    })
  }
  next()
}

module.exports = validate