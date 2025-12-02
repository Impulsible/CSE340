const utilities = require("../utilities/")
const { AccountModel } = require("../models/account-model")
const bcrypt = require("bcryptjs")
const JWTUtils = require('../utilities/jwtUtils')

class AccountController {
  static async buildLogin(req, res, next) {
    try {
      console.log('🔍 Login page requested');
      
      const nav = await utilities.getNav();
      res.render('account/login', {
        title: 'Login',
        nav,
        errors: null,
        messages: res.locals.flashMessages || {}
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
        messages: res.locals.flashMessages || {}
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

      console.log('📝 Registration attempt:', { account_firstname, account_email });

      // Check if account already exists
      const existingAccount = await AccountModel.findByEmail(account_email);
      if (existingAccount) {
        console.log('❌ Account already exists');
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

      console.log('✅ Account created, ID:', newAccount.account_id);

      // Create JWT token using AccountModel data
      const token = JWTUtils.createAuthToken(newAccount);
      console.log('✅ JWT token created');
      
      // Set cookie
      JWTUtils.setAuthCookie(res, token);
      
      console.log('✅ JWT cookie set, redirecting to dashboard');

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

      // Verify password using model method
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

      // Create JWT token
      const token = JWTUtils.createAuthToken(account);
      console.log('✅ JWT token created');
      
      // Set cookie using JWTUtils
      JWTUtils.setAuthCookie(res, token);
      
      console.log('✅ JWT cookie set, redirecting to dashboard');

      req.flash('success', `Welcome back, ${account.account_firstname}!`);
      res.redirect('/account/dashboard');

    } catch (error) {
      console.error('❌ Login error:', error);
      req.flash('error', 'Login failed. Please try again.');
      res.redirect('/account/login');
    }
  }

  static async buildDashboard(req, res, next) {
    try {
      console.log('🚀 Building dashboard...');
      
      // Check user authentication
      if (!req.user) {
        console.log('❌ No user found, redirecting to login');
        req.flash('error', 'Please log in to access the dashboard.');
        return res.redirect('/account/login');
      }

      // Get fresh account data from database
      const accountData = await AccountModel.findById(req.user.account_id);
      
      if (!accountData) {
        console.log('❌ Account not found in database');
        req.flash('error', 'Account not found.');
        return res.redirect('/account/login');
      }

      console.log('✅ User authenticated:', accountData.account_firstname);
      console.log('✅ Account type:', accountData.account_type);

      const nav = await utilities.getNav();
      
      // Prepare user data for template
      const userData = {
        ...accountData,
        // Add compatibility fields
        userId: accountData.account_id,
        firstName: accountData.account_firstname,
        lastName: accountData.account_lastname,
        email: accountData.account_email,
        role: accountData.account_type === 'Admin' ? 'admin' : 
              accountData.account_type === 'Employee' ? 'employee' : 'user'
      };

      res.render('account/dashboard', {
        title: 'Account Dashboard',
        nav,
        user: userData,
        messages: res.locals.flashMessages || {}
      });
      
      console.log('✅ Dashboard rendered successfully');
      
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      
      if (error.message.includes('Failed to lookup view')) {
        console.log('❌ Template not found');
        res.send(`
          <h1>Dashboard</h1>
          <p>User: ${req.user ? req.user.account_firstname : 'Not logged in'}</p>
          <p>Template error. Please check views/account/dashboard.ejs</p>
          <a href="/">Home</a>
        `);
      } else {
        next(error);
      }
    }
  }

  static async buildUpdateView(req, res, next) {
    try {
      console.log('🔄 Update view requested');
      
      if (!req.user) {
        req.flash('error', 'Please log in to update your account.');
        return res.redirect('/account/login');
      }

      // Get fresh account data
      const accountData = await AccountModel.findById(req.user.account_id);
      
      if (!accountData) {
        req.flash('error', 'Account not found.');
        return res.redirect('/account/dashboard');
      }

      const nav = await utilities.getNav();
      
      // Prepare user data
      const userData = {
        ...accountData,
        userId: accountData.account_id,
        firstName: accountData.account_firstname,
        lastName: accountData.account_lastname,
        email: accountData.account_email
      };

      res.render('account/update', {
        title: 'Update Account',
        nav,
        user: userData,
        errors: null,
        messages: res.locals.flashMessages || {}
      });
      
    } catch (error) {
      console.error('❌ Update view error:', error);
      req.flash('error', 'Error loading update form.');
      res.redirect('/account/dashboard');
    }
  }

  static async updateAccount(req, res, next) {
    try {
      console.log('📝 Update account request START ==========');
      console.log('Current user:', req.user);
      console.log('Request body:', req.body);
      
      if (!req.user) {
        console.log('❌ No user authenticated');
        req.flash('error', 'Please log in to update your account.');
        return res.redirect('/account/login');
      }

      const { account_id, account_firstname, account_lastname, account_email } = req.body;
      
      // Validate required fields
      if (!account_id || !account_firstname || !account_lastname || !account_email) {
        console.log('❌ Missing required fields');
        req.flash('error', 'All fields are required.');
        return res.redirect(`/account/update/${req.user.account_id}`);
      }
      
      // Verify account ownership
      const parsedAccountId = parseInt(account_id);
      if (parsedAccountId !== req.user.account_id) {
        console.log('❌ Account ID mismatch:', parsedAccountId, 'vs', req.user.account_id);
        req.flash('error', 'You can only update your own account.');
        return res.redirect('/account/dashboard');
      }

      console.log('✅ Account ownership verified');
      
      // Check if email is being changed and if it exists
      const currentAccount = await AccountModel.findById(account_id);
      if (!currentAccount) {
        console.log('❌ Current account not found in database');
        req.flash('error', 'Account not found.');
        return res.redirect('/account/dashboard');
      }
      
      console.log('Current email:', currentAccount.account_email);
      console.log('New email:', account_email);
      
      if (currentAccount.account_email !== account_email) {
        console.log('📧 Email is being changed, checking uniqueness...');
        const existingAccount = await AccountModel.findByEmail(account_email);
        if (existingAccount && existingAccount.account_id !== parsedAccountId) {
          console.log('❌ Email already exists for another account');
          req.flash('error', 'Email address already exists.');
          return res.redirect(`/account/update/${account_id}`);
        }
      }

      console.log('✅ Email check passed');
      
      // Update account in database
      console.log('💾 Calling updateAccountInfo...');
      const updatedAccount = await AccountModel.updateAccountInfo(
        account_id,
        account_firstname,
        account_lastname,
        account_email
      );

      if (!updatedAccount) {
        console.log('❌ Database update returned null');
        req.flash('error', 'Account not found or update failed.');
        return res.redirect(`/account/update/${account_id}`);
      }

      console.log('✅ Account updated in database:', updatedAccount);

      // Create new JWT token with updated data
      console.log('🔑 Creating new JWT token...');
      const token = JWTUtils.createAuthToken(updatedAccount);
      JWTUtils.setAuthCookie(res, token);
      console.log('✅ JWT token created and cookie set');

      req.flash('success', 'Account information updated successfully!');
      console.log('✅ Redirecting to dashboard');
      res.redirect('/account/dashboard');

    } catch (error) {
      console.error('❌ Update account error:', error.message);
      console.error('Error stack:', error.stack);
      req.flash('error', `Account update failed: ${error.message}`);
      res.redirect(`/account/update/${req.body.account_id || req.user?.account_id || ''}`);
    }
  }

  // TASK 5: New password update method
  static async updatePassword(req, res, next) {
    try {
      console.log('🔑 Update password request START ==========');
      console.log('Current user:', req.user);
      console.log('Request body:', req.body);
      
      if (!req.user) {
        req.flash('error', 'Please log in to change your password.');
        return res.redirect('/account/login');
      }

      const { account_id, new_password } = req.body;
      
      // Verify account ownership
      if (parseInt(account_id) !== req.user.account_id) {
        req.flash('error', 'You can only change your own password.');
        return res.redirect('/account/dashboard');
      }

      console.log('Password update for account:', account_id);
      
      // Update password
      const passwordUpdated = await AccountModel.updatePassword(
        account_id,
        new_password
      );

      if (!passwordUpdated) {
        throw new Error('Password update failed - no rows affected');
      }

      console.log('✅ Password updated successfully');

      req.flash('success', 'Password changed successfully!');
      res.redirect('/account/dashboard');

    } catch (error) {
      console.error('❌ Update password error:', error);
      req.flash('error', 'Password change failed. Please try again.');
      res.redirect(`/account/update/${req.body.account_id || req.user.account_id}`);
    }
  }

  static async logout(req, res, next) {
    try {
      console.log('🚪 Logout requested');
      
      // Clear the JWT cookie using JWTUtils
      JWTUtils.clearAuthCookie(res);
      
      console.log('✅ JWT cookie cleared');
      req.flash('success', 'You have been successfully logged out.');
      res.redirect('/');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      next(error);
    }
  }
}

// Export compatibility functions
async function buildLogin(req, res, next) {
  return AccountController.buildLogin(req, res, next);
}

async function buildRegister(req, res, next) {
  return AccountController.buildRegister(req, res, next);
}

// Export everything
module.exports = {
  buildLogin,
  buildRegister,
  AccountController
}