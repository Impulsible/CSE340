const pool = require("../database/");

async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    return null;
  }
}

// FIX: Rename this function to match what the controller expects
async function getVehicleDetailById(inv_id) {  // Changed from getInventoryItemById
  try {
    const sql = `
      SELECT i.*, c.classification_name 
      FROM public.inventory i
      INNER JOIN public.classification c ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleDetailById error: " + error);
    return null;
  }
}

// Add this function for featured vehicles in navigation
async function getFeaturedInventory() {
  try {
    const data = await pool.query(`
      SELECT inv_id, inv_make, inv_model, inv_year 
      FROM public.inventory 
      ORDER BY inv_year DESC 
      LIMIT 5
    `);
    return data.rows;
  } catch (error) {
    console.error("getFeaturedInventory error: " + error);
    return [];
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleDetailById,  // Changed from getInventoryItemById
  getFeaturedInventory   // Added this new function
};