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

// Enhanced Flash Messages for Render
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
    secureCookie: process.env.NODE_ENV === 'production'
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
    environment: process.env.NODE_ENV,
    renderExternalUrl: process.env.RENDER_EXTERNAL_URL,
    nodeEnv: process.env.NODE_ENV,
    secureCookie: process.env.NODE_ENV === 'production'
  });
});

/* ***********************
 * Error Handling
 *************************/
app.use(async (req, res) => {
  const nav = await utilities.getNav()
  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    nav
  })
})

app.use(async (err, req, res, next) => {
  console.error('❌ Server Error:', err)
  const nav = await utilities.getNav()
  res.status(500).render('errors/500', {
    title: '500 - Server Error',
    nav,
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
  console.log(`✅ Render-compatible flash messages enabled`)
  console.log(`✅ Trust proxy configured`)
  console.log(`Home page: http://localhost:${port}/`)
  console.log(`Flash test: http://localhost:${port}/test-flash`)
  console.log(`Render test: http://localhost:${port}/render-flash-test`)
  console.log(`Session debug: http://localhost:${port}/debug-session`)
})