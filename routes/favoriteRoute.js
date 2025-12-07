// File: routes/favoriteRoute.js
const router = require("express").Router();
const FavoriteController = require("../controllers/favoriteController");
const utilities = require("../utilities");
const { requireAuth } = require("../middleware/authMiddleware"); // Updated import

/* ***************************
 * Routes
 * ************************** */

// AJAX endpoint to toggle favorite status
router.post("/toggle", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  FavoriteController.validateToggleFavorite(),
  utilities.handleErrors(FavoriteController.toggleFavorite)
);

// Get favorite status for a specific vehicle (AJAX)
router.get("/status/:vehicle_id", 
  utilities.handleErrors(FavoriteController.getFavoriteStatus)
);

// View favorites page
router.get("/", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  utilities.handleErrors(FavoriteController.getFavoritesView)
);

// Update favorite notes (AJAX)
router.post("/update-notes", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  utilities.handleErrors(FavoriteController.updateFavoriteNotes)
);

// Update favorite priority (AJAX)
router.post("/update-priority", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  utilities.handleErrors(FavoriteController.updateFavoritePriority)
);

// Get recent favorites for dashboard (AJAX)
router.get("/recent", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  utilities.handleErrors(FavoriteController.getRecentFavorites)
);

// Get favorite statistics (AJAX)
router.get("/stats", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  utilities.handleErrors(FavoriteController.getFavoriteStats)
);

// Export favorites to CSV
router.get("/export", 
  requireAuth,  // Changed from isAuthenticated to requireAuth
  utilities.handleErrors(FavoriteController.exportFavorites)
);

module.exports = router;