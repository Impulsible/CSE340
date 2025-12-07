const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const utilities = require("../utilities");
const { requireEmployeeOrAdmin } = require("../middleware/jwtMiddleware");

// ======================
// PUBLIC CONTACT ROUTES
// ======================

// Display contact form
router.get("/contact", utilities.handleErrors(contactController.buildContact));

// Process contact form submission
router.post("/contact", utilities.handleErrors(contactController.processContact));

// Contact success page
router.get("/contact/success", utilities.handleErrors(contactController.contactSuccess));

// ======================
// PROTECTED ADMIN CONTACT ROUTES
// ======================

// View all contact submissions
router.get(
  "/admin/contact/submissions",
  requireEmployeeOrAdmin,
  utilities.handleErrors(contactController.viewContactSubmissions)
);

// View single contact submission
router.get(
  "/admin/contact/submission/:contact_id",
  requireEmployeeOrAdmin,
  utilities.handleErrors(contactController.viewContactSubmission)
);

// Delete contact submission
router.post(
  "/admin/contact/delete",
  requireEmployeeOrAdmin,
  utilities.handleErrors(contactController.deleteContactSubmission)
);

module.exports = router;