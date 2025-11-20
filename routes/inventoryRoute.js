const express = require("express");
const router = express.Router();
const invController = require("../controllers/inventoryController");

// Inventory classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Vehicle detail view
router.get("/detail/:inv_id", invController.buildVehicleDetail);

module.exports = router;