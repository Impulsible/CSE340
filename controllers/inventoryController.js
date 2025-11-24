const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/**
 * Build inventory by classification view - UPDATED WITH DYNAMIC NAV
 */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    console.log(`🔄 Loading classification: ${classification_id}`);
    
    const vehicles = await invModel.getInventoryByClassificationId(classification_id);
    console.log(`📊 Found ${vehicles ? vehicles.length : 0} vehicles`);
    
    // Use dynamic navigation
    const nav = await utilities.getNav();
    
    // Get classification name for the title
    const classifications = await invModel.getClassifications();
    const currentClassification = classifications.rows.find(c => c.classification_id == classification_id);
    const title = currentClassification ? `${currentClassification.classification_name} Vehicles` : "Vehicles";
    
    res.render("./inventory/classification", {
      title: title,
      nav: nav,
      vehicles: vehicles || []
    });
    
  } catch (error) {
    console.error("❌ Controller error:", error);
    next(error);
  }
};

/**
 * Build vehicle detail view - UPDATED WITH DYNAMIC NAV
 */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    console.log(`🔄 Loading vehicle: ${inv_id}`);
    
    const vehicle = await invModel.getVehicleDetailById(inv_id);
    
    if (!vehicle) return res.status(404).send("Vehicle not found");

    // Use dynamic navigation
    const nav = await utilities.getNav();
    
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
 * Display management view - FIXED FLASH MESSAGES
 */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    
    // Get flash message from res.locals (set by your middleware)
    const message = res.locals.flashMessages?.message?.[0] || null;
    
    console.log("📢 Flash messages available:", res.locals.flashMessages);
    console.log("📢 Message to display:", message);
    
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: message
    });
  } catch (error) {
    console.error("❌ Management view error:", error);
    next(error);
  }
};

/**
 * Display add classification form - FIXED FLASH
 */
invCont.addClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = res.locals.flashMessages?.message?.[0] || null;
    
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      message: message
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
 * Display add inventory form - FIXED FLASH
 */
invCont.addInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const message = res.locals.flashMessages?.message?.[0] || null;
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      message: message
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

/**
 * Test flash message route
 */
invCont.testFlash = async function (req, res, next) {
  req.flash("message", "🎉 Test flash message is working!");
  res.redirect("/inv/");
};

/**
 * Debug flash messages
 */
invCont.debugFlash = async function (req, res, next) {
  const nav = await utilities.getNav();
  
  console.log("🔍 Session ID:", req.sessionID);
  console.log("🔍 Flash messages:", req.flash());
  console.log("🔍 res.locals.flashMessages:", res.locals.flashMessages);
  
  res.render("inventory/debug", {
    title: "Flash Debug",
    nav,
    sessionId: req.sessionID,
    flashMessages: res.locals.flashMessages,
    reqFlash: req.flash()
  });
};

module.exports = invCont;