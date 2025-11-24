const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {}; // ← THIS LINE WAS MISSING!

/**
 * Build inventory by classification view - SIMPLIFIED
 */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    console.log(`🔄 Loading classification: ${classification_id}`);
    
    const vehicles = await invModel.getInventoryByClassificationId(classification_id);
    console.log(`📊 Found ${vehicles ? vehicles.length : 0} vehicles`);
    
    // Simple navigation fallback
    const nav = `
      <nav class="main-nav">
        <ul class="nav-list">
          <li><a href="/">Home</a></li>
          <li><a href="/inv/type/1">Custom</a></li>
          <li><a href="/inv/type/2">Sport</a></li>
          <li><a href="/inv/type/3">SUV</a></li>
          <li><a href="/inv/type/4">Truck</a></li>
          <li><a href="/inv/type/5">Sedan</a></li>
        </ul>
      </nav>
    `;
    
    const titles = {
      1: "Custom Vehicles",
      2: "Sport Cars", 
      3: "SUVs",
      4: "Trucks",
      5: "Sedans"
    };
    
    res.render("./inventory/classification", {
      title: titles[classification_id] || "Vehicles",
      nav: nav,
      vehicles: vehicles || []
    });
    
  } catch (error) {
    console.error("❌ Controller error:", error);
    next(error);
  }
};

/**
 * Build vehicle detail view - SIMPLIFIED
 */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    console.log(`🔄 Loading vehicle: ${inv_id}`);
    
    const vehicle = await invModel.getVehicleDetailById(inv_id);
    
    if (!vehicle) return res.status(404).send("Vehicle not found");

    const nav = `
      <nav class="main-nav">
        <ul class="nav-list">
          <li><a href="/">Home</a></li>
          <li><a href="/inv/type/1">Custom</a></li>
          <li><a href="/inv/type/2">Sport</a></li>
          <li><a href="/inv/type/3">SUV</a></li>
          <li><a href="/inv/type/4">Truck</a></li>
          <li><a href="/inv/type/5">Sedan</a></li>
        </ul>
      </nav>
    `;
    
    res.render("./inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav: nav,
      vehicle: vehicle
    });
    
  } catch (error) {
    console.error("❌ Vehicle detail error:", error);
    next(error);
  }
};

/**
 * Display management view
 */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("message") || null
    });
  } catch (error) {
    console.error("❌ Management view error:", error);
    next(error);
  }
};

/**
 * Display add classification form
 */
invCont.addClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      message: req.flash("message") || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process add classification form - FIXED VERSION
 */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    console.log("🟢 Controller: Starting classification addition for:", classification_name);
    
    const result = await invModel.addClassification(classification_name);
    console.log("📊 Controller: Result from model:", result);
    
    // FIXED: Check for rowCount OR if rows array exists and has data
    if (result.rowCount > 0 || (result.rows && result.rows.length > 0)) {
      console.log("✅ Controller: Classification added successfully!");
      req.flash("message", "Classification added successfully!");
      return res.redirect("/inv/");
    } else {
      console.log("❌ Controller: No rows affected or empty result");
      throw new Error("Failed to add classification - no data returned");
    }
  } catch (error) {
    console.log("🔴 Controller: Error occurred:", error.message);
    req.flash("message", "Sorry, the classification could not be added.");
    const nav = await utilities.getNav();
    
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [error.message],
      message: { type: "error", message: "Sorry, the classification could not be added." }
    });
  }
};

/**
 * Display add inventory form
 */
invCont.addInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      message: req.flash("message") || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process add inventory form
 */
invCont.addInventory = async function (req, res, next) {
  try {
    const result = await invModel.addInventory(req.body);
    
    if (result.rowCount > 0) {
      req.flash("message", "Inventory item added successfully!");
      return res.redirect("/inv/");
    } else {
      throw new Error("Failed to add inventory item");
    }
  } catch (error) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    
    req.flash("message", "Sorry, the inventory item could not be added.");
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: [error.message],
      message: { type: "error", message: "Sorry, the inventory item could not be added." },
      ...req.body
    });
  }
};

module.exports = invCont;