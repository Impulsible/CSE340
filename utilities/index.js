const invModel = require("../models/inventory-model");

/* ***************************
 *  Build Navigation Dynamically from Database
 * ************************** */
async function getNav() {
  try {
    const data = await invModel.getClassifications();
    let nav = '<ul class="nav-list">';
    nav += '<li><a href="/">Home</a></li>';
    
    data.rows.forEach((row) => {
      nav += `<li><a href="/inv/type/${row.classification_id}" title="View our ${row.classification_name} lineup">${row.classification_name}</a></li>`;
    });
    
    nav += '<li><a href="/account/login">Account</a></li>';
    nav += '</ul>';
    return nav;
  } catch (error) {
    console.error('Error building navigation:', error);
    // Fallback to basic navigation if database fails
    return `
      <ul class="nav-list">
        <li><a href="/">Home</a></li>
        <li><a href="/inv/type/1">Custom</a></li>
        <li><a href="/inv/type/2">Sport</a></li>
        <li><a href="/inv/type/3">SUV</a></li>
        <li><a href="/inv/type/4">Truck</a></li>
        <li><a href="/inv/type/5">Sedan</a></li>
        <li><a href="/account/login">Account</a></li>
      </ul>
    `;
  }
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