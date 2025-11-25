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
 * Display management view - UPDATED FOR RENDER FLASH MESSAGES
 */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    
    // Get ALL flash messages (updated for Render compatibility)
    const flashMessages = res.locals.flashMessages || {};
    console.log("📢 Flash messages available:", flashMessages);
    
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: flashMessages,
      message: flashMessages.message ? flashMessages.message[0] : null // Backward compatibility
    });
  } catch (error) {
    console.error("❌ Management view error:", error);
    next(error);
  }
};

/**
 * Display add classification form - UPDATED FOR RENDER FLASH
 */
invCont.addClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const flashMessages = res.locals.flashMessages || {};
    
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: flashMessages,
      message: flashMessages.message ? flashMessages.message[0] : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process add classification form - UPDATED FOR RENDER COMPATIBILITY
 */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    console.log("🟢 Controller: Starting classification addition for:", classification_name);
    
    const result = await invModel.addClassification(classification_name);
    console.log("📊 Controller: Result from model:", result);
    
    if (result.rowCount > 0 || (result.rows && result.rows.length > 0)) {
      console.log("✅ Controller: Classification added successfully!");
      
      // CLEAR NAVIGATION CACHE
      utilities.clearNavCache();
      console.log("🗑️ Navigation cache cleared");
      
      // Use consistent flash message types
      req.flash("success", `Classification "${classification_name}" added successfully!`);
      
      // Use session.save for Render compatibility
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.redirect("/inv/");
        }
        console.log('✅ Session saved with flash message');
        return res.redirect("/inv/");
      });
      
    } else {
      console.log("❌ Controller: No rows affected or empty result");
      throw new Error("Failed to add classification - no data returned");
    }
  } catch (error) {
    console.log("🔴 Controller: Error occurred:", error.message);
    req.flash("error", "Sorry, the classification could not be added.");
    
    // Move nav retrieval outside the callback
    const nav = await utilities.getNav();
    const flashMessages = res.locals.flashMessages || {};
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      }
      
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [error.message],
        messages: flashMessages,
        message: { type: "error", message: "Sorry, the classification could not be added." }
      });
    });
  }
};

/**
 * Display add inventory form - UPDATED FOR RENDER FLASH
 */
invCont.addInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const flashMessages = res.locals.flashMessages || {};
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      messages: flashMessages,
      message: flashMessages.message ? flashMessages.message[0] : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process add inventory form - UPDATED FOR RENDER COMPATIBILITY
 */
invCont.addInventory = async function (req, res, next) {
  try {
    const result = await invModel.addInventory(req.body);
    
    if (result.rowCount > 0) {
      req.flash("success", "Inventory item added successfully!");
      
      // Use session.save for Render compatibility
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
        }
        console.log('✅ Session saved with inventory flash message');
        return res.redirect("/inv/");
      });
    } else {
      throw new Error("Failed to add inventory item");
    }
  } catch (error) {
    req.flash("error", "Sorry, the inventory item could not be added.");
    
    // Move nav and classificationList retrieval outside the callback
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    const flashMessages = res.locals.flashMessages || {};
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      }
      
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: [error.message],
        messages: flashMessages,
        message: { type: "error", message: "Sorry, the inventory item could not be added." },
        ...req.body
      });
    });
  }
};

/**
 * Delete classification - NEW FUNCTION FOR RENDER COMPATIBILITY
 */
invCont.deleteClassification = async function (req, res, next) {
  try {
    const { classification_id } = req.body;
    console.log("🗑️ Controller: Starting classification deletion for ID:", classification_id);
    
    // First check if there are any vehicles in this classification
    const vehicles = await invModel.getInventoryByClassificationId(classification_id);
    
    if (vehicles && vehicles.length > 0) {
      req.flash("error", "Cannot delete classification - there are vehicles assigned to it. Please remove or reassign the vehicles first.");
      
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
        }
        return res.redirect("/inv/");
      });
      return;
    }
    
    const result = await invModel.deleteClassification(classification_id);
    console.log("📊 Controller: Delete result from model:", result);
    
    if (result.rowCount > 0) {
      console.log("✅ Controller: Classification deleted successfully!");
      
      // CLEAR NAVIGATION CACHE
      utilities.clearNavCache();
      console.log("🗑️ Navigation cache cleared");
      
      req.flash("success", "Classification deleted successfully!");
    } else {
      req.flash("error", "Classification not found or could not be deleted.");
    }
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      }
      return res.redirect("/inv/");
    });
  } catch (error) {
    console.log("🔴 Controller: Error occurred:", error.message);
    req.flash("error", "Sorry, the classification could not be deleted.");
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      }
      return res.redirect("/inv/");
    });
  }
};

/**
 * Test flash message route - UPDATED FOR RENDER
 */
invCont.testFlash = async function (req, res, next) {
  req.flash("success", "🎉 Test flash message is working!");
  req.flash("error", "⚠️ This is a test error message.");
  req.flash("info", "ℹ️ This is a test info message.");
  
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
    }
    res.redirect("/inv/");
  });
};

/**
 * Debug flash messages - UPDATED FOR RENDER
 */
invCont.debugFlash = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    
    console.log("🔍 Session ID:", req.sessionID);
    console.log("🔍 Session:", req.session);
    console.log("🔍 res.locals.flashMessages:", res.locals.flashMessages);
    console.log("🔍 req.flash():", req.flash());
    
    res.render("inventory/debug", {
      title: "Flash Debug",
      nav,
      sessionId: req.sessionID || 'No session ID',
      sessionData: req.session || {},
      flashMessages: res.locals.flashMessages || {}
    });
  } catch (error) {
    console.error("❌ Debug route error:", error);
    res.status(500).send(`Debug error: ${error.message}`);
  }
};

module.exports = invCont;