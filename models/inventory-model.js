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

async function getInventoryItemById(inventory_id) {
  try {
    const sql = `
      SELECT inv.*, classification_name 
      FROM inventory inv
      INNER JOIN classification c ON inv.classification_id = c.classification_id
      WHERE inv_id = $1
    `;
    const data = await pool.query(sql, [inventory_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryItemById error: " + error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById
};