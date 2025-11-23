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

// Session Middleware (Memory store for now)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key-12345",
    resave: false,
    saveUninitialized: true,
    name: "sessionId",
    store: new session.MemoryStore(),
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
  console.log(`Home page: http://localhost:${port}/`)
  console.log(`Account login: http://localhost:${port}/account/login`)
  console.log(`DB test: http://localhost:${port}/db-test`)
})
