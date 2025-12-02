// middleware/authMiddleware.js
const JWTUtils = require('../utilities/jwtUtils');

// Check if user is authenticated (general auth)
const requireAuth = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/account/login');
    }
    next();
};

// Check if user is Employee or Admin (inventory management)
const requireEmployeeOrAdmin = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/account/login');
    }
    
    if (req.user.account_type !== 'Employee' && req.user.account_type !== 'Admin') {
        req.flash('error', 'You do not have permission to access this page.');
        return res.redirect('/account/dashboard');
    }
    
    next();
};

// Check if user is Admin only
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'Please log in to access this page.');
        return res.redirect('/account/login');
    }
    
    if (req.user.account_type !== 'Admin') {
        req.flash('error', 'Admin access required.');
        return res.redirect('/account/dashboard');
    }
    
    next();
};

module.exports = {
    requireAuth,
    requireEmployeeOrAdmin,
    requireAdmin
};