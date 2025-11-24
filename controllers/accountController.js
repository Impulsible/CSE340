const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

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
 *  Process Registration (fixed!)
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  console.log("REG BODY:", req.body)

  try {
    // 🔒 Hash password BEFORE saving to DB
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Insert into DB
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    console.log("REG RESULT:", regResult)

    // Check if insert succeeded
    if (regResult && regResult.rows && regResult.rows.length > 0) {
      const msg = `Congratulations, you're registered ${account_firstname}. Please log in.`
      req.flash("notice", msg)
      res.locals.flashMessages = { notice: [msg] }

      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }

    // If insert failed
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
  } catch (err) {
    console.error("Registration error:", err)

    req.flash("notice", "A system error occurred. Try again.")
    res.locals.flashMessages = { notice: ["A system error occurred. Try again."] }

    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount
}
