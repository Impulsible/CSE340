const invModel = require("../models/inventory-model");
const JWTUtils = require('./jwtUtils');
const { requireAuth, requireAdmin } = require('../middleware/jwtMiddleware'); // Fixed path

// Cache variables for navigation
let navCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/* ***************************
 *  Build Navigation Dynamically from Database
 * ************************** */
async function getNav() {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (navCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("📦 Using cached navigation");
      return navCache;
    }
    
    console.log("🔄 Building fresh navigation from database");
    const data = await invModel.getClassifications();
    console.log(`📊 Found ${data.rows.length} classifications in database`);
    
    let nav = '';
    
    // Add Home link first (matches your hardcoded structure)
    nav += '<li><a href="/">Home</a></li>';
    
    data.rows.forEach((row) => {
      console.log(`   - ${row.classification_name} (ID: ${row.classification_id})`);
      
      // Map classification names to your existing URL structure
      const urlMap = {
        'custom': '/custom',
        'sport': '/sport',
        'suv': '/suv', 
        'truck': '/truck',
        'sedan': '/sedan'
      };
      
      const url = urlMap[row.classification_name.toLowerCase()] || `/inv/type/${row.classification_id}`;
      
      // Generate the exact same HTML structure as your hardcoded links
      nav += `
        <li>
          <a href="${url}" title="View our ${row.classification_name} lineup">${row.classification_name}</a>
        </li>
      `;
    });
    
    // Add Account link last (matches your hardcoded structure)
    nav += '<li><a href="/account/login">Account</a></li>';
    
    // Update cache
    navCache = nav;
    cacheTimestamp = now;
    console.log("✅ Navigation cache updated");
    
    return nav;
  } catch (error) {
    console.error('❌ Error building navigation:', error);
    return null; // Return null to use fallback in header
  }
}

/* ***************************
 *  Clear Navigation Cache (call this when classifications change)
 * ************************** */
function clearNavCache() {
  const hadCache = navCache !== null;
  navCache = null;
  cacheTimestamp = null;
  console.log(`🗑️ Navigation cache cleared (had cache: ${hadCache})`);
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
  clearNavCache,
  buildClassificationGrid,
  buildClassificationList,
  handleErrors,
  
  // Add new JWT and auth utilities
  JWTUtils,
  requireAuth,
  requireAdmin
};