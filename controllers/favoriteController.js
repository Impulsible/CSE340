const utilities = require("../utilities/");
const FavoriteModel = require("../models/favorite-model");
const InventoryModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");

/* ****************************************
*  FAVORITE VEHICLES CONTROLLER
*  Handles all HTTP requests for favorites
*  Uses express-validator for input validation
*  Provides JSON responses for AJAX calls
* **************************************** */

class FavoriteController {
  /* ***************************
   * VALIDATION MIDDLEWARE
   * Uses express-validator for server-side validation
   * ************************** */
  static validateToggleFavorite() {
    return [
      // FIXED: Removed async validation that was causing errors
      body('vehicle_id')
        .trim()
        .notEmpty().withMessage('Vehicle ID is required')
        .isInt({ min: 1 }).withMessage('Vehicle ID must be a positive integer'),
        // REMOVED: The problematic async custom validator
        /*
        .custom(async (value, { req }) => {
          // Check if vehicle exists in database
          const vehicle = await InventoryModel.getVehicleById(value);
          if (!vehicle) {
            throw new Error('Vehicle not found in database');
          }
          return true;
        }),
        */
      
      body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
      
      body('priority')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Priority must be between 1 and 5')
    ];
  }

  /* ***************************
   * TOGGLE FAVORITE STATUS (AJAX ENDPOINT)
   * Handles adding/removing favorites
   * Returns JSON response
   * ************************** */
  static async toggleFavorite(req, res) {
    try {
      console.log("🔍 Favorite toggle request received:");
      console.log("  - Request body:", req.body);
      console.log("  - User:", req.user ? `ID: ${req.user.account_id}` : 'No user');
      
      // Server-side validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("🔴 Validation errors:", errors.array());
        console.log("🔴 Validation error details:", errors.array().map(e => ({
          param: e.param,
          msg: e.msg,
          value: e.value
        })));
        
        return res.status(400).json({
          success: false,
          errors: errors.array().map(err => ({
            field: err.path,
            message: err.msg
          })),
          message: 'Please correct the validation errors'
        });
      }

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          code: 'UNAUTHORIZED',
          message: 'Please log in to save favorites' 
        });
      }

      const { vehicle_id, notes, priority } = req.body;
      const account_id = req.user.account_id;

      // FIXED: Add vehicle existence check manually (not in validation)
      try {
        // Check if vehicle exists
        const vehicle = await InventoryModel.getInventoryById(vehicle_id);
        if (!vehicle) {
          return res.status(404).json({
            success: false,
            code: 'VEHICLE_NOT_FOUND',
            message: 'The requested vehicle does not exist'
          });
        }
      } catch (error) {
        console.log("⚠️ Vehicle check error:", error.message);
        // Continue anyway - don't fail the request
      }

      // Check if vehicle is already favorited
      const isCurrentlyFavorite = await FavoriteModel.isFavorite(account_id, vehicle_id);
      
      let result;
      let action;

      if (isCurrentlyFavorite) {
        // Remove from favorites
        result = await FavoriteModel.removeFavorite(account_id, vehicle_id);
        action = 'removed';
      } else {
        // Check if user can add more favorites
        const limitCheck = await FavoriteModel.canAddMoreFavorites(account_id);
        if (!limitCheck.canAdd) {
          return res.status(400).json({
            success: false,
            code: 'LIMIT_EXCEEDED',
            message: `You have reached the maximum limit of ${limitCheck.maxAllowed} favorites. Please remove some before adding new ones.`,
            stats: limitCheck
          });
        }

        // Add to favorites
        result = await FavoriteModel.addFavorite(account_id, vehicle_id, notes, priority);
        action = result.action;
      }

      if (result.success) {
        // Get updated statistics
        const favoriteCount = await FavoriteModel.getVehicleFavoriteCount(vehicle_id);
        const userStats = await FavoriteModel.getUserFavoriteStats(account_id);
        const newStatus = !isCurrentlyFavorite;
        
        console.log("✅ Favorite toggle successful:");
        console.log("  - Action:", action);
        console.log("  - New status:", newStatus);
        console.log("  - Favorite count:", favoriteCount);
        
        return res.status(200).json({
          success: true,
          action: action,
          isFavorite: newStatus,
          favoriteCount: favoriteCount,
          userStats: userStats.stats,
          message: `Vehicle ${action} ${action === 'added' ? 'to' : 'from'} favorites successfully`,
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(500).json({
          success: false,
          code: 'DATABASE_ERROR',
          message: 'Failed to update favorites. Please try again.',
          error: process.env.NODE_ENV === 'development' ? result.error : undefined
        });
      }

    } catch (error) {
      console.error('❌ Toggle favorite controller error:', error);
      
      // Different error responses based on error type
      if (error.message.includes('Vehicle not found')) {
        return res.status(404).json({
          success: false,
          code: 'VEHICLE_NOT_FOUND',
          message: 'The requested vehicle does not exist'
        });
      }
      
      return res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred. Please try again later.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /* ***************************
   * GET FAVORITES VIEW (HTML PAGE)
   * Renders the favorites management page
   * ************************** */
  static async getFavoritesView(req, res, next) {
    try {
      // Check authentication
      if (!req.user) {
        req.flash('notice', 'Please log in to view your favorite vehicles');
        return res.redirect('/account/login');
      }

      const account_id = req.user.account_id;
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
      const offset = (page - 1) * limit;

      // Get user's favorites with pagination
      const favoritesResult = await FavoriteModel.getUserFavorites(account_id, limit, offset);
      
      if (!favoritesResult.success) {
        req.flash('error', 'Unable to load your favorites. Please try again.');
        return res.redirect('/account/management');
      }

      // Get user stats
      const statsResult = await FavoriteModel.getUserFavoriteStats(account_id);
      const limitCheck = await FavoriteModel.canAddMoreFavorites(account_id);

      const nav = await utilities.getNav();
      const totalPages = Math.ceil(favoritesResult.total / limit);

      res.render('account/favorites', {
        title: 'My Favorite Vehicles',
        nav,
        favorites: favoritesResult.favorites,
        userStats: statsResult.stats,
        limitCheck: limitCheck,
        currentPage: page,
        totalPages: totalPages,
        totalFavorites: favoritesResult.total,
        user: req.user,
        messages: req.flash(),
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Account', url: '/account/management' },
          { name: 'Favorites', url: '/account/favorites' }
        ]
      });

    } catch (error) {
      console.error('Get favorites view error:', error);
      
      // Special handling for database errors
      if (error.message.includes('Failed to retrieve favorites')) {
        req.flash('error', 'Unable to load your favorites at this time. Please try again later.');
        return res.redirect('/account/management');
      }
      
      // Pass to global error handler
      next(error);
    }
  }

  /* ***************************
   * GET FAVORITE STATUS FOR VEHICLE (AJAX)
   * Returns favorite status and count for a specific vehicle
   * ************************** */
  static async getFavoriteStatus(req, res) {
    try {
      const { vehicle_id } = req.params;
      
      // Basic validation
      if (!vehicle_id || isNaN(vehicle_id)) {
        return res.status(400).json({
          isFavorite: false,
          favoriteCount: 0,
          error: 'Invalid vehicle ID'
        });
      }

      let isFavorite = false;
      let favoriteCount = 0;

      // Get favorite count for vehicle (public info)
      favoriteCount = await FavoriteModel.getVehicleFavoriteCount(parseInt(vehicle_id));

      // Check if current user has favorited this vehicle
      if (req.user) {
        isFavorite = await FavoriteModel.isFavorite(req.user.account_id, parseInt(vehicle_id));
      }

      return res.json({
        isFavorite: isFavorite,
        favoriteCount: favoriteCount,
        authenticated: !!req.user
      });

    } catch (error) {
      console.error('Get favorite status error:', error);
      return res.status(500).json({ 
        isFavorite: false, 
        favoriteCount: 0,
        error: 'Unable to retrieve favorite status'
      });
    }
  }

  /* ***************************
   * UPDATE FAVORITE NOTES (AJAX)
   * Allows users to update notes for a favorited vehicle
   * ************************** */
  static async updateFavoriteNotes(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const { vehicle_id, notes } = req.body;
      const account_id = req.user.account_id;

      // Basic validation
      if (!vehicle_id || isNaN(vehicle_id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid vehicle ID is required'
        });
      }

      if (notes && notes.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Notes cannot exceed 500 characters'
        });
      }

      const result = await FavoriteModel.updateFavoriteNotes(account_id, vehicle_id, notes);

      if (result.success) {
        return res.json({
          success: true,
          message: 'Notes updated successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to update notes'
        });
      }

    } catch (error) {
      console.error('Update favorite notes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating notes'
      });
    }
  }

  /* ***************************
   * UPDATE FAVORITE PRIORITY (AJAX)
   * Allows users to update priority for a favorited vehicle
   * ************************** */
  static async updateFavoritePriority(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const { vehicle_id, priority } = req.body;
      const account_id = req.user.account_id;

      // Basic validation
      if (!vehicle_id || isNaN(vehicle_id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid vehicle ID is required'
        });
      }

      if (!priority || priority < 1 || priority > 5) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be between 1 and 5'
        });
      }

      const result = await FavoriteModel.updateFavoritePriority(account_id, vehicle_id, priority);

      if (result.success) {
        return res.json({
          success: true,
          message: 'Priority updated successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to update priority'
        });
      }

    } catch (error) {
      console.error('Update favorite priority error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating priority'
      });
    }
  }

  /* ***************************
   * GET RECENT FAVORITES FOR DASHBOARD (AJAX)
   * Returns recent favorites for dashboard display
   * ************************** */
  static async getRecentFavorites(req, res) {
    try {
      if (!req.user) {
        return res.json({
          success: false,
          favorites: [],
          message: 'Not authenticated'
        });
      }

      const result = await FavoriteModel.getRecentFavorites(req.user.account_id, 5);

      return res.json({
        success: result.success,
        favorites: result.favorites,
        count: result.favorites.length
      });

    } catch (error) {
      console.error('Get recent favorites error:', error);
      return res.json({
        success: false,
        favorites: [],
        message: 'Unable to load recent favorites'
      });
    }
  }

  /* ***************************
   * GET FAVORITE STATISTICS (AJAX)
   * Returns statistics about user's favorites
   * ************************** */
  static async getFavoriteStats(req, res) {
    try {
      if (!req.user) {
        return res.json({
          success: false,
          stats: {},
          message: 'Not authenticated'
        });
      }

      const result = await FavoriteModel.getUserFavoriteStats(req.user.account_id);

      return res.json({
        success: result.success,
        stats: result.stats
      });

    } catch (error) {
      console.error('Get favorite stats error:', error);
      return res.json({
        success: false,
        stats: {},
        message: 'Unable to load statistics'
      });
    }
  }

  /* ***************************
   * EXPORT FAVORITES TO CSV
   * Allows users to download their favorites as CSV
   * ************************** */
  static async exportFavorites(req, res) {
    try {
      if (!req.user) {
        req.flash('error', 'Please log in to export favorites');
        return res.redirect('/account/login');
      }

      const account_id = req.user.account_id;
      
      // Get all favorites (no pagination for export)
      const result = await FavoriteModel.getUserFavorites(account_id, 1000, 0);
      
      if (!result.success || result.favorites.length === 0) {
        req.flash('error', 'No favorites to export');
        return res.redirect('/account/favorites');
      }

      // Create CSV headers
      const headers = [
        'Vehicle ID',
        'Year',
        'Make',
        'Model',
        'Classification',
        'Price',
        'Mileage',
        'Color',
        'Priority',
        'Notes',
        'Date Added'
      ];

      // Create CSV rows
      const rows = result.favorites.map(favorite => [
        favorite.inv_id,
        favorite.inv_year,
        `"${favorite.inv_make}"`,
        `"${favorite.inv_model}"`,
        `"${favorite.classification_name}"`,
        favorite.inv_price,
        favorite.inv_miles,
        `"${favorite.inv_color}"`,
        favorite.priority,
        `"${(favorite.notes || '').replace(/"/g, '""')}"`,
        new Date(favorite.created_at).toLocaleDateString()
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="cse-motors-favorites-${new Date().toISOString().split('T')[0]}.csv"`);
      
      res.send(csvContent);

    } catch (error) {
      console.error('Export favorites error:', error);
      req.flash('error', 'Failed to export favorites. Please try again.');
      res.redirect('/account/favorites');
    }
  }
}

module.exports = FavoriteController;