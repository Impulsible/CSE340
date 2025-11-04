const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.disable("x-powered-by");

// Routes
app.get("/", (_req, res) => res.render("index", { title: "CSE Motors" }));
app.get("/custom", (_req, res) => res.render("custom", { title: "Custom | CSE Motors" }));
app.get("/sedan", (_req, res) => res.render("sedan", { title: "Sedan | CSE Motors" }));
app.get("/suv", (_req, res) => res.render("suv", { title: "SUV | CSE Motors" }));
app.get("/truck", (_req, res) => res.render("truck", { title: "Truck | CSE Motors" }));
app.get("/account", (_req, res) => res.render("account", { title: "My Account | CSE Motors" }));

// 404
app.use((req, res) => {
  res.status(404).render("404", { title: "Not Found | CSE Motors", url: req.originalUrl });
});

// 500
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).render("500", { title: "Server Error | CSE Motors" });
});

app.listen(PORT, () => console.log(`CSE Motors at http://localhost:${PORT}`));