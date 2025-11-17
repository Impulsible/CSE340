const buildDetailView = async (data) => {
  try {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(data.inv_price);

    const formattedMiles = new Intl.NumberFormat('en-US').format(data.inv_miles);

    return `
      <div class="vehicle-detail-container">
        <div class="vehicle-image">
          <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
        </div>
        <div class="vehicle-info">
          <h1>${data.inv_year} ${data.inv_make} ${data.inv_model}</h1>
          <div class="price-mileage">
            <p class="price">${formattedPrice}</p>
            <p class="mileage">${formattedMiles} miles</p>
          </div>
          <div class="specifications">
            <p><strong>Classification:</strong> ${data.classification_name}</p>
            <p><strong>Color:</strong> ${data.inv_color}</p>
            <p><strong>Year:</strong> ${data.inv_year}</p>
          </div>
          <div class="description">
            <h2>Description</h2>
            <p>${data.inv_description}</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("buildDetailView error: " + error);
    return "<p>Error loading vehicle details.</p>";
  }
};

module.exports = {
  buildDetailView
};

const buildClassificationGrid = async (data) => {
  try {
    let grid = '';
    
    data.forEach(vehicle => {
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(vehicle.inv_price);

      grid += `
        <div class="vehicle-card">
          <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
          <div class="vehicle-name">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</div>
          <div class="vehicle-price">${formattedPrice}</div>
          <a href="/inv/detail/${vehicle.inv_id}" class="btn btn-primary btn-sm mt-2">View Details</a>
        </div>
      `;
    });
    
    return grid;
  } catch (error) {
    console.error("buildClassificationGrid error: " + error);
    return "<p>Error loading vehicles.</p>";
  }
};

module.exports = {
  buildDetailView,
  buildClassificationGrid
};