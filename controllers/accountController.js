const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ***************************
 *  Deliver login view
 * ************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: res.locals.account_email
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: res.locals.account_firstname,
    account_lastname: res.locals.account_lastname,
    account_email: res.locals.account_email
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  // Helpful debug logs in your terminal
  console.log("REG BODY:", req.body)

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  console.log("REG RESULT:", regResult)

  // SUCCESS: regResult should be a query result with rows
  if (regResult && regResult.rows && regResult.rows.length > 0) {
    const msg = `Congratulations, you're registered ${account_firstname}. Please log in.`
    req.flash("notice", msg)
    // make flash available immediately on this render
    res.locals.flashMessages = { notice: [msg] }

    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
  }

  // FAILURE: keep values in the form and show error message
  const failMsg = "Sorry, the registration failed."
  req.flash("notice", failMsg)
  res.locals.flashMessages = { notice: [failMsg] }

  return res.status(501).render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email
  })
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount
}
