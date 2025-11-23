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
  handleErrors
};