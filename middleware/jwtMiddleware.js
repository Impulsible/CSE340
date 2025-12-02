// ./middleware/jwtMiddleware.js
const JWTUtils = require('../utilities/jwtUtils');
const { AccountModel } = require('../models/account-model');

/* ***********************
 * Enhanced JWT Authentication Middleware
 * FIXED: For Task 1 & 3 compatibility
 *************************/
const authenticateToken = async (req, res, next) => {
  try {
    const token = JWTUtils.extractToken(req);
    
    if (!token) {
      // Set consistent null values
      req.user = null;
      res.locals.loggedIn = false;
      res.locals.user = null;
      res.locals.accountData = null;
      return next();
    }

    const decoded = JWTUtils.verifyToken(token);
    
    if (!decoded) {
      JWTUtils.clearAuthCookie(res);
      req.user = null;
      res.locals.loggedIn = false;
      res.locals.user = null;
      res.locals.accountData = null;
      return next();
    }

    // Try to get fresh account data from database
    let accountData = null;
    try {
      accountData = await AccountModel.findById(decoded.userId || decoded.account_id);
    } catch (dbError) {
      console.log('⚠️ Could not fetch account from DB, using JWT data:', dbError.message);
    }

    // Merge JWT data with database data
    const userData = {
      // Database fields
      account_id: accountData?.account_id || decoded.account_id || decoded.userId,
      account_firstname: accountData?.account_firstname || decoded.account_firstname || decoded.firstName,
      account_lastname: accountData?.account_lastname || decoded.account_lastname || decoded.lastName,
      account_email: accountData?.account_email || decoded.account_email || decoded.email,
      account_type: accountData?.account_type || decoded.account_type || 'Client',
      
      // JWT fields for compatibility
      userId: decoded.userId || decoded.account_id,
      firstName: decoded.firstName || decoded.account_firstname,
      lastName: decoded.lastName || decoded.account_lastname,
      email: decoded.email || decoded.account_email,
      role: decoded.role || (decoded.account_type === 'Admin' ? 'admin' : 
                           decoded.account_type === 'Employee' ? 'employee' : 'user')
    };

    // Set user data for controllers and templates
    req.user = userData;
    
    // Set locals with correct naming for EJS templates (Task 1 & 3)
    res.locals.loggedIn = true;
    res.locals.user = userData;
    res.locals.accountData = userData; // For compatibility
    
    console.log(`✅ [JWT Middleware] Authenticated: ${userData.account_firstname} (${userData.account_type})`);
    next();
    
  } catch (error) {
    console.error('❌ [JWT Middleware] Verification failed:', error.message);
    
    // Clear invalid token
    JWTUtils.clearAuthCookie(res);
    req.user = null;
    res.locals.loggedIn = false;
    res.locals.user = null;
    res.locals.accountData = null;
    
    next();
  }
};

/* ***********************
 * Authentication & Authorization Middleware
 *************************/

// Alias for authenticateToken (used in account routes)
const checkLoginStatus = authenticateToken;

// Authorization middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    req.flash('notice', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }
  next();
};

/* ***********************
 * Employee/Admin Middleware (TASK 2)
 *************************/
const requireEmployeeOrAdmin = (req, res, next) => {
  if (!req.user) {
    req.flash('notice', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }

  if (req.user.account_type !== 'Employee' && req.user.account_type !== 'Admin') {
    req.flash('notice', 'You must be an Employee or Admin to access this page.');
    return res.redirect('/account/login');
  }

  next();
};

/* ***********************
 * Admin Only Middleware
 *************************/
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    req.flash('notice', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }

  if (req.user.account_type !== 'Admin') {
    req.flash('notice', 'You must be an Administrator to access this page.');
    return res.redirect('/account/dashboard');
  }

  next();
};

module.exports = {
  authenticateToken,
  checkLoginStatus,
  requireAuth,
  requireEmployeeOrAdmin,
  requireAdmin
};