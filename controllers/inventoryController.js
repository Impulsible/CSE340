const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const buildByInventoryId = async (req, res, next) => {
  try {
    const inventory_id = parseInt(req.params.inventoryId);
    const data = await invModel.getInventoryItemById(inventory_id);
    
    if (!data) {
      throw new Error("Vehicle not found");
    }
    
    const grid = await utilities.buildDetailView(data);
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      grid,
    });
  } catch (error) {
    next(error);
  }
};
const buildByClassificationId = async (req, res, next) => {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    if (!data || data.length === 0) {
      return next({ status: 404, message: "No vehicles found in this classification" });
    }
    
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    
    res.render("./inventory/classification", {
      title: `${data[0].classification_name} | CSE Motors`,
      grid,
      nav
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  buildByClassificationId,
  buildByInventoryId
};