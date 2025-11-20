const invModel = require("../models/inventory-model");

const invCont = {};

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
    
    // Simple titles
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
    
    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    // Simple navigation
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

module.exports = invCont;