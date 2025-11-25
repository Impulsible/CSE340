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

// Make public files available
app.use(express.static("public"))

// Layout system
app.use(expressLayouts)

// Body parsing using body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Session Middleware with PostgreSQL Store
const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 3600,
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-key-12345-change-in-production",
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}

// Environment-specific cookie settings
if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.secure = true
  console.log('🔒 Production mode: Secure cookies enabled')
} else {
  sessionConfig.cookie.secure = false
  console.log('🔓 Development mode: Secure cookies disabled')
}

app.use(session(sessionConfig))

// Enhanced Flash Messages
app.use(require("connect-flash")())
app.use((req, res, next) => {
  res.locals.flashMessages = {
    success: req.flash('success'),
    error: req.flash('error'), 
    warning: req.flash('warning'),
    info: req.flash('info'),
    message: req.flash('message')
  }
  
  // Debug logging in development
  if (process.env.NODE_ENV !== 'production') {
    const hasMessages = Object.values(res.locals.flashMessages).some(messages => messages.length > 0)
    if (hasMessages) {
      console.log('📢 Flash messages:', res.locals.flashMessages)
    }
  }
  
  next()
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
    sessionStore: "PostgreSQL"
  })
})

app.get("/test-flash", (req, res) => {
  req.flash("success", "Flash messages are working!")
  req.flash("error", "This is a test error message.")
  req.flash("info", "This is a test info message.")
  res.redirect("/")
})

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
  console.log(`✅ PostgreSQL session store configured`)
  console.log(`✅ Enhanced flash messages enabled`)
  console.log(`Home page: http://localhost:${port}/`)
  console.log(`Flash test: http://localhost:${port}/test-flash`)
})