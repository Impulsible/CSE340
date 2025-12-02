const jwt = require('jsonwebtoken');

class JWTUtils {
  static createToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
  }

  // Create auth token specifically for accounts
  static createAuthToken(account) {
    return this.createToken({
      userId: account.account_id,
      account_id: account.account_id,
      email: account.account_email,
      account_email: account.account_email,
      firstName: account.account_firstname,
      account_firstname: account.account_firstname,
      lastName: account.account_lastname,
      account_lastname: account.account_lastname,
      account_type: account.account_type || 'Client',
      role: account.account_type === 'Admin' ? 'admin' : 
            account.account_type === 'Employee' ? 'employee' : 'user'
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Extract token from request
  static extractToken(req) {
    // Check cookies first - look for 'jwt'
    if (req.cookies && req.cookies.jwt) {
      return req.cookies.jwt;
    }
    
    // Check Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return null;
  }

  // Set auth cookie
  static setAuthCookie(res, token) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
  }

  // Clear auth cookie
  static clearAuthCookie(res) {
    res.clearCookie('jwt', {
      path: '/'
    });
  }
}

module.exports = JWTUtils;