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

/* ***********************
 * Middleware
 *************************/

// Make public files available
app.use(express.static("public"))

// Layout system
app.use(expressLayouts)

// Body parsing using body-parser (REPLACES express.json/express.urlencoded)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // handles form submissions

// Session Middleware with PostgreSQL Store (PRODUCTION READY)
app.use(
  session({
    store: new pgSession({
      pool: pool, // Use your existing database pool
      tableName: 'session', // Use the session table we created
      createTableIfMissing: true, // Auto-create table if missing
      pruneSessionInterval: 3600, // Cleanup every hour (seconds)
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-key-12345-change-in-production",
    resave: false,
    saveUninitialized: false, // Changed to false for better security
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      httpOnly: true, // Prevent client-side JS access
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  })
)

// Flash Messages
app.use(require("connect-flash")())
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash()
  next()
})

app.set("view engine", "ejs")
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use("/", require("./routes/static"))
app.use("/inv", require("./routes/inventoryRoute"))

// Account routes
app.use("/account", require("./routes/accountRoute"))

/* ***********************
 * DB Test Route
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

/* ***********************
 * Session Test Route
 *************************/
app.get("/session-test", (req, res) => {
  // Test session functionality
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
    sessionStore: "PostgreSQL" // Confirm we're using PostgreSQL
  })
})

/* ***********************
 * Test Flash Route
 *************************/
app.get("/test-flash", (req, res) => {
  req.flash("success", "Flash messages are working!")
  req.flash("notice", "This is a test notice message.")
  res.redirect("/")
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500
app.listen(port, () => {
  console.log(`🚗 CSE Motors running on port ${port}`)
  console.log(`✅ PostgreSQL session store configured`)
  console.log(`✅ MemoryStore warning eliminated`)
  console.log(`Home page: http://localhost:${port}/`)
  console.log(`Account login: http://localhost:${port}/account/login`)
  console.log(`DB test: http://localhost:${port}/db-test`)
  console.log(`Session test: http://localhost:${port}/session-test`)
})