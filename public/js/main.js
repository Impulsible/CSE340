// main.js
require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3500;

// Routers
const staticRoute = require("./routes/static");
const inventoryRoute = require("./routes/inventoryroute");
const errorRoute = require("./routes/errorroute");
const utilities = require("./utilities");

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/", staticRoute);
app.use("/inv", inventoryRoute);
app.use("/error", errorRoute);

// 404 middleware (no route matched)
app.use(async (req, res, next) => {
  const nav = await utilities.getNav();
  res.status(404).render("errors/404", {
    title: "Page Not Found",
    message: "Sorry, the page you requested could not be found.",
    nav,
  });
});

// Error-handling middleware (500 & others)
app.use(async (err, req, res, next) => {
  console.error(err.stack);

  const nav = await utilities.getNav();
  const status = err.status || 500;

  res.status(status).render("errors/505", {
    title: "Server Error",
    message: err.message || "Something went wrong on the server.",
    nav,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

  document.addEventListener('DOMContentLoaded', () => {
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);

        // Close other dropdowns
        dropdownToggles.forEach(other => {
          if (other !== toggle) other.setAttribute('aria-expanded', 'false');
        });
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-dropdown')) {
        dropdownToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
      }
    });
  });


  // Global Account Dropdown Script - Works on ALL pages
document.addEventListener("DOMContentLoaded", () => {
  const accountMenu = document.querySelector(".account-menu");
  const accountToggle = document.querySelector(".account-toggle");

  if (accountMenu && accountToggle) {
    accountToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = accountToggle.getAttribute("aria-expanded") === "true";
      const newState = !expanded;

      accountToggle.setAttribute("aria-expanded", String(newState));
      accountMenu.classList.toggle("open", newState);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      accountMenu.classList.remove("open");
      accountToggle.setAttribute("aria-expanded", "false");
    });

    // Prevent dropdown from closing when clicking inside
    accountMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
});