const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/**
 * Build inventory by classification view
 */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    if (!data || data.length === 0) {
      const error = new Error("No vehicles found for this classification");
      error.status = 404;
      throw error;
    }

    // If you have a grid building function, use it. Otherwise use simple display.
    let grid;
    if (utilities.buildClassificationGrid) {
      grid = await utilities.buildClassificationGrid(data);
    } else {
      // Simple fallback - create basic HTML
      grid = data.map(vehicle => `
        <div class="vehicle-item">
          <h3>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h3>
          <p>Price: $${vehicle.inv_price}</p>
          <a href="/inv/detail/${vehicle.inv_id}">View Details</a>
        </div>
      `).join('');
    }

    let nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Vehicles";
    
    res.render("./inventory/classification", {
      title: `${className} - CSE Motors`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Build vehicle detail view - FIXED FUNCTION
 */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    
    if (isNaN(inv_id)) {
      const error = new Error("Invalid vehicle ID");
      error.status = 400;
      throw error;
    }

    // FIX: This should match the model function name
    const vehicleData = await invModel.getVehicleDetailById(inv_id);
    
    if (!vehicleData) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }

    const nav = await utilities.getNav();
    
    // Use the utility function if it exists, otherwise create basic HTML
    let vehicleHTML;
    if (utilities.buildVehicleDetailHTML) {
      vehicleHTML = utilities.buildVehicleDetailHTML(vehicleData);
    } else {
      // Fallback basic HTML
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(vehicleData.inv_price);

      const formattedMiles = new Intl.NumberFormat('en-US').format(vehicleData.inv_miles);

      vehicleHTML = `
        <div class="vehicle-detail-container">
          <div class="vehicle-image">
            <img src="${vehicleData.inv_image}" alt="${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}" class="img-fluid">
          </div>
          <div class="vehicle-info">
            <h1>${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}</h1>
            <div class="price-mileage">
              <p class="price">${formattedPrice}</p>
              <p class="mileage">${formattedMiles} miles</p>
            </div>
            <div class="vehicle-specs">
              <p><strong>Color:</strong> ${vehicleData.inv_color}</p>
              <p><strong>Classification:</strong> ${vehicleData.classification_name}</p>
            </div>
            <div class="vehicle-description">
              <h3>Vehicle Description</h3>
              <p>${vehicleData.inv_description}</p>
            </div>
          </div>
        </div>
      `;
    }
    
    res.render("./inventory/detail", {
      title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model} - CSE Motors`,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;