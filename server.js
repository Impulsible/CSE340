/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

// Suppress deprecation warnings
process.removeAllListeners("warning")

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const app = express()

// Session requires
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)

// Body-parser
const bodyParser = require("body-parser")

// Database pool (for DB test and general use)
const pool = require("./database")

// Utilities (for navigation)
const utilities = require("./utilities")

// Route imports
const staticRoutes = require("./routes/static")
const inventoryRoutes = require("./routes/inventoryRoute")
const accountRoutes = require("./routes/accountRoute")

/* ***********************
 * Middleware
 *************************/

// Trust Render proxy (CRITICAL FOR RENDER)
app.set('trust proxy', 1);

// Make public files available
app.use(express.static("public"))

// Layout system
app.use(expressLayouts)

// Body parsing using body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie parser for JWT tokens
app.use(cookieParser())

// Render-compatible Session Configuration
const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 3600,
  }),
  secret: process.env.SESSION_SECRET || "cse340-motors-render-secret-2024",
  resave: false,
  saveUninitialized: true, // Changed to true for Render compatibility
  name: "sessionId",
  proxy: true, // Add this for Render
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin on Render
    secure: process.env.NODE_ENV === 'production' // Force HTTPS on Render
  }
}

app.use(session(sessionConfig))

/* ***********************
 * Enhanced JWT Authentication Middleware
 *************************/
const JWTUtils = require('./utilities/jwtUtils');
const { AccountModel } = require('./models/account-model'); // ✅ FIXED: Use destructuring

/* ***********************
 * Debug Routes
 *************************/
app.get("/debug-modules", (req, res) => {
  const modulePaths = [
    '../models/account-model',
    '../middleware/jwtMiddleware', 
    '../utilities',
    '../controllers/accountController'
  ];
  
  const results = {};
  
  modulePaths.forEach(path => {
    try {
      const module = require(path);
      results[path] = {
        loaded: true,
        keys: Object.keys(module),
        hasAccountModel: !!module.AccountModel,
        accountModelType: typeof module.AccountModel,
        hasFindById: module.AccountModel ? typeof module.AccountModel.findById : 'no AccountModel'
      };
    } catch (error) {
      results[path] = { loaded: false, error: error.message };
    }
  });
  
  res.json(results);
});

app.get("/debug-accountmodel", (req, res) => {
  try {
    const accountModelModule = require('./models/account-model');
    res.json({
      importKeys: Object.keys(accountModelModule),
      hasAccountModel: !!accountModelModule.AccountModel,
      accountModelMethods: accountModelModule.AccountModel ? Object.getOwnPropertyNames(accountModelModule.AccountModel) : 'none',
      hasFindById: accountModelModule.AccountModel ? typeof accountModelModule.AccountModel.findById : 'no AccountModel',
      findByIdFunction: accountModelModule.AccountModel ? accountModelModule.AccountModel.findById.toString() : 'none'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

/* ***********************
 * Debug Routes for Account Management
 *************************/
app.get("/debug-accounts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password 
      FROM account 
      ORDER BY account_id
    `);
    
    res.json({
      totalAccounts: result.rows.length,
      accounts: result.rows.map(account => ({
        id: account.account_id,
        firstName: account.account_firstname,
        lastName: account.account_lastname,
        email: account.account_email,
        type: account.account_type,
        hasPassword: !!account.account_password
      }))
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post("/debug-delete-account", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const result = await pool.query(
      "DELETE FROM account WHERE account_email = $1 RETURNING account_email",
      [email]
    );
    
    if (result.rows.length > 0) {
      res.json({ message: `Account ${email} deleted successfully` });
    } else {
      res.status(404).json({ error: `Account with email ${email} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/delete-henry-account", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM account WHERE account_email = $1 RETURNING *",
      ['henryosuagwu22@gmail.com']
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        success: true, 
        message: "Account henryosuagwu22@gmail.com deleted successfully",
        deletedAccount: result.rows[0] 
      });
    } else {
      res.json({ 
        success: false, 
        message: "Account henryosuagwu22@gmail.com not found" 
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/debug-account-manager", (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Account Manager</h1>
        <a href="/debug-accounts">View All Accounts</a><br>
        <a href="/delete-henry-account">Delete Henry's Account</a>
        <h2>Delete Any Account</h2>
        <form action="/debug-delete-account" method="POST">
          <input type="email" name="email" placeholder="Email to delete" required>
          <button type="submit">Delete Account</button>
        </form>
      </body>
    </html>
  `);
});

const authenticateToken = async (req, res, next) => {
  try {
    const token = JWTUtils.extractToken(req);
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = JWTUtils.verifyToken(token);
    
    // Skip database verification for test users (userId: 999)
    if (decoded.userId !== 999) {
      // Verify user still exists in database
      const currentUser = await AccountModel.findById(decoded.userId);
      if (!currentUser) {
        JWTUtils.clearAuthCookie(res);
        req.user = null;
        return next();
      }
    }

    req.user = decoded;
    console.log(`✅ JWT Authenticated user: ${decoded.email}`);
    next();
    
  } catch (error) {
    console.error('❌ JWT Verification failed:', error.message);
    
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

// Apply JWT authentication to all routes
app.use(authenticateToken);

/* ***********************
 * Enhanced Flash Messages for Render
 *************************/
app.use(require("connect-flash")())
app.use((req, res, next) => {
  // Store original redirect function to preserve flash
  const originalRedirect = res.redirect;
  res.redirect = function(url) {
    if (req.session) {
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error during redirect:', err);
        }
        originalRedirect.call(this, url);
      });
    } else {
      originalRedirect.call(this, url);
    }
  };

  // Enhanced flash handling with fallbacks
  res.locals.flashMessages = {
    success: req.flash('success') || [],
    error: req.flash('error') || [],
    warning: req.flash('warning') || [],
    info: req.flash('info') || [],
    message: req.flash('message') || []
  };

  // Make user data available to all EJS templates
  res.locals.user = req.user || null;

  // Debug logging for both environments
  const hasMessages = Object.values(res.locals.flashMessages).some(messages => messages.length > 0);
  if (hasMessages) {
    console.log('📢 Flash messages detected:', {
      success: res.locals.flashMessages.success,
      error: res.locals.flashMessages.error,
      info: res.locals.flashMessages.info,
      environment: process.env.NODE_ENV
    });
  }
  
  next();
})

app.set("view engine", "ejs")
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use("/", staticRoutes)
app.use("/inv", inventoryRoutes)
app.use("/account", accountRoutes)

/* ***********************
 * JWT Test Routes
 *************************/
app.get("/jwt-test", (req, res) => {
  if (!req.user) {
    return res.json({
      authenticated: false,
      message: "No JWT token found or invalid token"
    });
  }

  res.json({
    authenticated: true,
    user: req.user,
    message: "JWT authentication successful"
  });
});

app.get("/create-test-token", (req, res) => {
  // Create a test JWT token (for testing purposes only)
  const testPayload = {
    userId: 999,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "user"
  };

  const token = jwt.sign(testPayload, process.env.JWT_SECRET, { 
    expiresIn: '1h' 
  });

  // ✅ Use JWTUtils to ensure consistent cookie settings with path: '/'
  JWTUtils.setAuthCookie(res, token);

  res.json({
    message: "Test JWT token created and set as cookie",
    token: token,
    user: testPayload
  });
});

app.post("/clear-token", (req, res) => {
  // ✅ Use JWTUtils for consistency
  JWTUtils.clearAuthCookie(res);
  res.json({ message: "JWT token cleared" });
});

/* ***********************
 * Test Routes
 *************************/
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    console.log("DB TEST RESULT:", result.rows[0])
    res.send("DB OK: " + result.rows[0].now)
  } catch (err) {
    console.error("DB TEST ERROR:", err)
    res.status(500).send("DB ERROR: " + err.message)
  }
})

app.get("/session-test", (req, res) => {
  if (!req.session.views) {
    req.session.views = 0
    req.session.firstVisit = new Date().toISOString()
  }
  req.session.views++
  
  res.json({
    message: "Session test successful",
    views: req.session.views,
    firstVisit: req.session.firstVisit,
    sessionId: req.sessionID,
    sessionStore: "PostgreSQL",
    environment: process.env.NODE_ENV,
    secureCookie: process.env.NODE_ENV === 'production',
    jwtUser: req.user // Show JWT user data if authenticated
  })
})

app.get("/test-flash", (req, res) => {
  console.log('🧪 Testing flash messages...');
  req.flash("success", "🎉 SUCCESS: Flash messages are working!")
  req.flash("error", "⚠️ ERROR: This is a test error message.")
  req.flash("info", "ℹ️ INFO: This is a test info message.")
  
  // Use session.save to ensure flash is preserved
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
    } else {
      console.log('✅ Session saved with flash messages');
    }
    res.redirect("/");
  });
})

/* ***********************
 * Render-Specific Test Routes
 *************************/
app.get("/render-flash-test", (req, res) => {
  console.log('🚀 RENDER FLASH TEST - Session ID:', req.sessionID);
  
  req.flash('success', '🎉 SUCCESS: Flash messages are working on Render!');
  req.flash('error', '⚠️ ERROR: This is a test error message on Render.');
  req.flash('info', 'ℹ️ INFO: This is a test info message on Render.');
  
  req.session.save((err) => {
    if (err) {
      console.log('❌ Render session save error:', err);
      res.redirect('/?flash_error=session_save_failed');
    } else {
      console.log('✅ Render session saved successfully');
      res.redirect('/');
    }
  });
});

app.get("/debug-session", (req, res) => {
  res.json({
    sessionId: req.sessionID,
    sessionExists: !!req.session,
    sessionData: req.session,
    cookies: req.headers.cookie,
    flashMessages: res.locals.flashMessages,
    jwtUser: req.user,
    environment: process.env.NODE_ENV,
    renderExternalUrl: process.env.RENDER_EXTERNAL_URL,
    nodeEnv: process.env.NODE_ENV,
    secureCookie: process.env.NODE_ENV === 'production'
  });
});

/* ***********************
 * Protected Route Example
 *************************/
app.get("/dashboard", (req, res) => {
  if (!req.user) {
    req.flash('error', 'Please log in to access the dashboard');
    return res.redirect('/account/login');
  }

  // User is authenticated via JWT
  res.render('account/dashboard', {
    title: 'Dashboard',
    user: req.user,
    messages: res.locals.flashMessages
  });
});

/* ***********************
 * API Routes with JWT Protection
 *************************/
app.get("/api/profile", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.json({
    message: 'Protected profile data',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

/* ***********************
 * Error Handling
 *************************/
app.use(async (req, res) => {
  const nav = await utilities.getNav()
  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    nav,
    user: req.user // Pass user to template for conditional rendering
  })
})

app.use(async (err, req, res, next) => {
  console.error('❌ Server Error:', err)
  const nav = await utilities.getNav()
  res.status(500).render('errors/500', {
    title: '500 - Server Error',
    nav,
    user: req.user, // Pass user to template for conditional rendering
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500
app.listen(port, () => {
  console.log(`🚗 CSE Motors running on port ${port}`)
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✅ PostgreSQL session store configured`)
  console.log(`✅ JWT Authentication enabled`)
  console.log(`✅ Render-compatible flash messages enabled`)
  console.log(`✅ Trust proxy configured`)
  console.log(`Home page: http://localhost:${port}/`)
  console.log(`JWT Test: http://localhost:${port}/jwt-test`)
  console.log(`Create Test Token: http://localhost:${port}/create-test-token`)
  console.log(`Flash test: http://localhost:${port}/test-flash`)
  console.log(`Render test: http://localhost:${port}/render-flash-test`)
  console.log(`Session debug: http://localhost:${port}/debug-session`)
  console.log(`Module debug: http://localhost:${port}/debug-modules`)
  console.log(`AccountModel debug: http://localhost:${port}/debug-accountmodel`)
  console.log(`Account Manager: http://localhost:${port}/debug-account-manager`)
  console.log(`View All Accounts: http://localhost:${port}/debug-accounts`)
  console.log(`Delete Henry's Account: http://localhost:${port}/delete-henry-account`)
})