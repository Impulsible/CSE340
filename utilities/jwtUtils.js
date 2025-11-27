const jwt = require('jsonwebtoken');

class JWTUtils {
  static signToken(payload) {
    return jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static createAuthToken(user) {
    const payload = {
      userId: user.account_id,
      email: user.account_email,
      firstName: user.account_firstname,
      lastName: user.account_lastname,
      role: user.account_type || 'Client'
    };

    return this.signToken(payload);
  }

  static setAuthCookie(res, token) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000, // days to ms
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/' // 🔥 ADD THIS LINE - makes cookie available across entire site
    };

    res.cookie('authToken', token, cookieOptions);
  }

  static clearAuthCookie(res) {
    res.clearCookie('authToken', {
      path: '/' // 🔥 ADD THIS LINE - must match the path used when setting
    });
  }

  static extractToken(req) {
    return req.cookies.authToken || req.headers['authorization']?.split(' ')[1];
  }
}

module.exports = JWTUtils;