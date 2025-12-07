const express = require("express");
const router = express.Router();
const invController = require("../controllers/inventoryController");
const utilities = require("../utilities");
const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inventory-validation");
const { requireEmployeeOrAdmin } = require("../middleware/jwtMiddleware");

// ---------------------
// Route to build management view (TASK 2: Protected)
// ---------------------
router.get(
  "/",
  requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
);

// ---------------------
// AJAX: Get Inventory by Classification (GET) - Public
// ---------------------
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// ---------------------
// Add Classification Form (GET) - TASK 2: Protected
// ---------------------
router.get(
  "/add-classification",
  requireEmployeeOrAdmin,
  utilities.handleErrors(invController.addClassificationView)
);

// ---------------------
// Process Add Classification (POST) - TASK 2: Protected
// ---------------------
router.post(
  "/add-classification",
  requireEmployeeOrAdmin,
  classValidate.classificationValidationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// ---------------------
// AJAX: Add Classification (POST) - TASK 2: Protected
// ---------------------
router.post(
  "/add-classification-ajax",
  requireEmployeeOrAdmin,
  classValidate.classificationValidationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassificationAJAX)
);

// ---------------------
// AJAX: Get Classifications (GET) - Public
// ---------------------
router.get(
  "/api/classifications",
  utilities.handleErrors(invController.getClassificationsAJAX)
);

// ---------------------
// Add Inventory Form (GET) - TASK 2: Protected
// ---------------------
router.get(
  "/add-inventory",
  requireEmployeeOrAdmin,
  utilities.handleErrors(invController.addInventoryView)
);

// ---------------------
// Process Add Inventory (POST) - TASK 2: Protected
// ---------------------
router.post(
  "/add-inventory",
  requireEmployeeOrAdmin,
  invValidate.inventoryValidationRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// ---------------------
// AJAX: Add Inventory (POST) - TASK 2: Protected
// ---------------------
router.post(
  "/add-inventory-ajax",
  requireEmployeeOrAdmin,
  invValidate.inventoryValidationRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventoryAJAX)
);

// ---------------------
// Debug routes for flash message testing - Public
// ---------------------
router.get("/debug-flash", utilities.handleErrors(invController.debugFlash));
router.get("/test-flash", utilities.handleErrors(invController.testFlash));

// ---------------------
// Inventory classification view - PUBLIC (Task 2 says NOT to protect)
// ---------------------
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// ---------------------
// Vehicle detail view - PUBLIC (Task 2 says NOT to protect)
// ---------------------
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildVehicleDetail)
);

// ---------------------
// Edit Inventory Form (GET) - TASK 2: Protected
// ---------------------
router.get(
  "/edit/:inv_id",
  requireEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);

// ---------------------
// Process Update Inventory (POST) - TASK 2: Protected
// ---------------------
router.post(
  "/update",
  requireEmployeeOrAdmin,
  invValidate.inventoryValidationRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// ---------------------
// DELETE ROUTES - TASK 2: Protected
// ---------------------

// GET route to show delete confirmation view
router.get(
  "/delete/:inv_id",
  requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirmation)
);

// POST route to handle the actual deletion
router.post(
  "/delete",
  requireEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
);

module.exports = router;