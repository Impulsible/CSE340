const utilities = require("../utilities/")
const { AccountModel } = require("../models/account-model") // ✅ Fixed import
const bcrypt = require("bcryptjs")
const JWTUtils = require('../utilities/jwtUtils');

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

class AccountController {
  static async buildLogin(req, res, next) {
    try {
      const nav = await utilities.getNav();
      res.render('account/login', {
        title: 'Login',
        nav,
        errors: null,
        messages: res.locals.flashMessages
      });
    } catch (error) {
      next(error);
    }
  }

  static async buildRegister(req, res, next) {
    try {
      const nav = await utilities.getNav();
      res.render('account/register', {
        title: 'Register',
        nav,
        errors: null,
        messages: res.locals.flashMessages
      });
    } catch (error) {
      next(error);
    }
  }

  static async registerAccount(req, res, next) {
    try {
      const { 
        account_firstname, 
        account_lastname, 
        account_email, 
        account_password 
      } = req.body;

      console.log('📝 Registration attempt:', { account_firstname, account_lastname, account_email });

      // Check if account already exists
      const existingAccount = await AccountModel.findByEmail(account_email);
      if (existingAccount) {
        console.log('❌ Account already exists:', existingAccount);
        req.flash('error', 'Account with this email already exists.');
        return res.redirect('/account/register');
      }

      // Create new account
      console.log('✅ Creating new account...');
      const newAccount = await AccountModel.createAccount({
        account_firstname,
        account_lastname,
        account_email,
        account_password
      });

      console.log('✅ Account created:', newAccount);

      // Create JWT token and set cookie
      const token = JWTUtils.createAuthToken(newAccount);
      JWTUtils.setAuthCookie(res, token);

      // Verify the token was created
      const decoded = JWTUtils.verifyToken(token);
      console.log('✅ JWT token created for:', decoded);

      req.flash('success', `Welcome ${account_firstname}! Your account has been created.`);
      res.redirect('/account/dashboard');

    } catch (error) {
      console.error('❌ Registration error:', error);
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/account/register');
    }
  }

  static async loginAccount(req, res, next) {
    try {
      const { account_email, account_password } = req.body;

      console.log('🔐 Login attempt for:', account_email);

      // Find account by email
      const account = await AccountModel.findByEmail(account_email);
      if (!account) {
        console.log('❌ Account not found');
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/account/login');
      }

      // Verify password
      const isPasswordValid = await AccountModel.verifyPassword(
        account_password, 
        account.account_password
      );

      if (!isPasswordValid) {
        console.log('❌ Invalid password');
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/account/login');
      }

      console.log('✅ Login successful for:', account.account_firstname);

      // Create JWT token and set cookie
      const token = JWTUtils.createAuthToken(account);
      JWTUtils.setAuthCookie(res, token);

      // Verify the token
      const decoded = JWTUtils.verifyToken(token);
      console.log('✅ JWT token created for:', decoded);

      req.flash('success', `Welcome back, ${account.account_firstname}!`);
      res.redirect('/account/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'Login failed. Please try again.');
      res.redirect('/account/login');
    }
  }

  static async buildDashboard(req, res, next) {
    try {
      if (!req.user) {
        req.flash('error', 'Please log in to access the dashboard.');
        return res.redirect('/account/login');
      }

      const nav = await utilities.getNav();
      res.render('account/dashboard', {
        title: 'Account Dashboard',
        nav,
        user: req.user,
        messages: res.locals.flashMessages
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      JWTUtils.clearAuthCookie(res);
      req.flash('success', 'You have been successfully logged out.');
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  }

  static async buildUpdateView(req, res, next) {
    try {
      if (!req.user) {
        req.flash('error', 'Please log in to update your account.');
        return res.redirect('/account/login');
      }

      const nav = await utilities.getNav();
      res.render('account/update', {
        title: 'Update Account',
        nav,
        user: req.user,
        errors: null,
        messages: res.locals.flashMessages
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAccount(req, res, next) {
    try {
      if (!req.user) {
        req.flash('error', 'Please log in to update your account.');
        return res.redirect('/account/login');
      }

      const { account_firstname, account_lastname, account_email } = req.body;
      
      const updatedAccount = await AccountModel.updateAccount(req.user.userId, {
        account_firstname,
        account_lastname,
        account_email
      });

      // Update JWT token with new data
      const token = JWTUtils.createAuthToken(updatedAccount);
      JWTUtils.setAuthCookie(res, token);

      req.flash('success', 'Account updated successfully!');
      res.redirect('/account/dashboard');

    } catch (error) {
      console.error('Update account error:', error);
      req.flash('error', 'Account update failed. Please try again.');
      res.redirect('/account/update');
    }
  }
}

// Export only the controller class
module.exports = {
  buildLogin,
  buildRegister,
  AccountController
}