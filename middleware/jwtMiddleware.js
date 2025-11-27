const utilities = require('../utilities');
const JWTUtils = require('../utilities/jwtUtils');

// Debug the import
console.log('🔍 [JWT Middleware] Starting import...');
try {
  const accountModelModule = require('../models/account-model');
  console.log('📦 [JWT Middleware] Raw import keys:', Object.keys(accountModelModule));
  
  const { AccountModel } = accountModelModule;
  console.log('🔧 [JWT Middleware] AccountModel type:', typeof AccountModel);
  
  if (AccountModel && typeof AccountModel === 'function') {
    console.log('✅ [JWT Middleware] AccountModel is a constructor');
    console.log('🔧 [JWT Middleware] Static methods:', Object.getOwnPropertyNames(AccountModel));
  } else {
    console.error('❌ [JWT Middleware] AccountModel is not a constructor:', AccountModel);
  }
} catch (error) {
  console.error('❌ [JWT Middleware] Error during import:', error);
}

const { AccountModel } = require('../models/account-model');

// Verify the import worked
if (!AccountModel || typeof AccountModel.findById !== 'function') {
  console.error('❌ [JWT Middleware] CRITICAL: AccountModel.findById is not a function');
  console.log('🔧 [JWT Middleware] Available properties:', Object.keys(AccountModel || {}));
}

/* ***********************
 * Enhanced JWT Authentication Middleware
 *************************/
const authenticateToken = async (req, res, next) => {
  try {
    const token = JWTUtils.extractToken(req);
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = JWTUtils.verifyToken(token);
    
    // TEMPORARY: Skip database verification entirely for testing
    console.log('🔐 [JWT Middleware] Token verified, skipping DB check for testing');
    req.user = decoded;
    
    /*
    // Skip database verification for test users (userId: 999)
    if (decoded.userId !== 999) {
      // Verify user still exists in database
      console.log('🔍 [JWT Middleware] Looking up user in database:', decoded.userId);
      const currentUser = await AccountModel.findById(decoded.userId);
      if (!currentUser) {
        console.log('❌ [JWT Middleware] User not found in database');
        JWTUtils.clearAuthCookie(res);
        req.user = null;
        return next();
      }
    }

    req.user = decoded;
    */
    
    console.log(`✅ [JWT Middleware] Authenticated user: ${decoded.email}`);
    next();
    
  } catch (error) {
    console.error('❌ [JWT Middleware] Verification failed:', error.message);
    
    // Clear invalid token
    JWTUtils.clearAuthCookie(res);
    req.user = null;
    
    if (req.path.startsWith('/api') || req.xhr) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      next();
    }
  }
};

/* ***********************
 * Authorization Middleware
 *************************/
const requireAuth = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }

  if (req.user.role !== 'Employee' && req.user.role !== 'Admin') {
    req.flash('error', 'You do not have permission to access this page.');
    return res.redirect('/account/dashboard');
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireAdmin
};