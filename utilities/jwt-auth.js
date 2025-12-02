const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTAuth {
  /**
   * Create JWT token for authenticated user (Assignment 5)
   */
  static createToken(accountData) {
    return jwt.sign(
      {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type || 'Client'
      },
      process.env.ACCESS_TOKEN_SECRET || 'your-jwt-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
  }

  /**
   * Set JWT cookie (Assignment 5)
   */
  static setToken(res, token) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
      path: '/'
    });
  }

  /**
   * Clear JWT cookie (Task 6 - Logout)
   */
  static clearToken(res) {
    res.clearCookie('jwt', {
      path: '/'
    });
  }

  /**
   * Verify token utility
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your-jwt-secret-key-change-in-production');
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return null;
    }
  }

  /**
   * Extract token from request
   */
  static extractToken(req) {
    return req.cookies.jwt;
  }
}

module.exports = JWTAuth;