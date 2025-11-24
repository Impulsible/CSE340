const invModel = require("../models/inventory-model");

/* ***************************
 *  Simple Navigation - No Database Calls
 * ************************** */
function getNav() {
  return `
    <nav class="main-nav" aria-label="Main navigation">
      <ul class="nav-list">
        <li><a href="/">Home</a></li>
        <li><a href="/inv/type/1">Custom Shop</a></li>
        <li><a href="/inv/type/2">Sport Cars</a></li>
        <li><a href="/inv/type/3">SUVs</a></li>
        <li><a href="/inv/type/4">Trucks</a></li>
        <li><a href="/inv/type/5">Sedans</a></li>
        <li><a href="/account/login">Account</a></li>
      </ul>
    </nav>
  `;
}

/* ***************************
 *  Simple Vehicle Grid Builder
 * ************************** */
function buildClassificationGrid(vehicles) {
  if (!vehicles || vehicles.length === 0) {
    return '<div class="no-vehicles"><p>No vehicles found in this category.</p></div>';
  }

  let grid = '<div class="vehicle-grid">';
  
  vehicles.forEach(vehicle => {
    grid += `
      <div class="vehicle-card">
        <a href="/inv/detail/${vehicle.inv_id}">
          <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
          <h3>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h3>
          <p class="price">$${vehicle.inv_price}</p>
        </a>
      </div>
    `;
  });
  
  grid += '</div>';
  return grid;
}

/* ***************************
 *  Build Classification List (for forms)
 * ************************** */
async function buildClassificationList(classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"';
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected ";
      }
      classificationList += ">" + row.classification_name + "</option>";
    });

    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error);
    return '<select name="classification_id" id="classificationList" required><option value="">Error loading classifications</option></select>';
  }
}

/* ***************************
 *  Error Handler Middleware
 * ************************** */
function handleErrors(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  getNav,
  buildClassificationGrid,
  buildClassificationList,
  handleErrors
};
