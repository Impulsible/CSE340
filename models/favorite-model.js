const pool = require("../database/");

/* ****************************************
*  FAVORITE VEHICLES MODEL
*  Handles all database operations for favorites
*  Uses prepared statements for security
* **************************************** */

class FavoriteModel {
  /* ***************************
   * VALIDATE FAVORITE DATA
   * Ensures account_id and vehicle_id are valid
   * ************************** */
  static validateFavoriteData(account_id, vehicle_id) {
    const errors = [];
    
    if (!account_id || isNaN(account_id) || account_id <= 0) {
      errors.push({ msg: 'Valid account ID is required' });
    }
    
    if (!vehicle_id || isNaN(vehicle_id) || vehicle_id <= 0) {
      errors.push({ msg: 'Valid vehicle ID is required' });
    }
    
    return errors;
  }

  /* ***************************
   * ADD VEHICLE TO FAVORITES
   * Uses ON CONFLICT to prevent duplicates
   * Returns favorite_id if successful
   * ************************** */
  static async addFavorite(account_id, vehicle_id, notes = null, priority = 1) {
    try {
      // Validate inputs
      const errors = this.validateFavoriteData(account_id, vehicle_id);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.msg).join(', ')}`);
      }

      // Check if vehicle exists first
      const vehicleCheck = await pool.query(
        'SELECT inv_id FROM inventory WHERE inv_id = $1',
        [vehicle_id]
      );
      
      if (vehicleCheck.rows.length === 0) {
        throw new Error('Vehicle not found');
      }

      // Insert or update favorite using prepared statement
      const sql = `
        INSERT INTO favorite_vehicles (account_id, vehicle_id, notes, priority) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (account_id, vehicle_id) 
        DO UPDATE SET 
          notes = EXCLUDED.notes,
          priority = EXCLUDED.priority,
          created_at = NOW()
        RETURNING favorite_id, created_at
      `;
      
      const result = await pool.query(sql, [account_id, vehicle_id, notes, priority]);
      
      return {
        success: true,
        favorite_id: result.rows[0].favorite_id,
        created_at: result.rows[0].created_at,
        action: result.rowCount > 0 ? 'added' : 'updated'
      };
      
    } catch (error) {
      console.error('Add favorite error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /* ***************************
   * REMOVE VEHICLE FROM FAVORITES
   * Returns true if removed successfully
   * ************************** */
  static async removeFavorite(account_id, vehicle_id) {
    try {
      const errors = this.validateFavoriteData(account_id, vehicle_id);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.msg).join(', ')}`);
      }

      const sql = `
        DELETE FROM favorite_vehicles 
        WHERE account_id = $1 AND vehicle_id = $2
        RETURNING favorite_id
      `;
      
      const result = await pool.query(sql, [account_id, vehicle_id]);
      
      return {
        success: result.rowCount > 0,
        removed: result.rowCount > 0
      };
      
    } catch (error) {
      console.error('Remove favorite error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /* ***************************
   * CHECK IF VEHICLE IS FAVORITED
   * Returns boolean
   * ************************** */
  static async isFavorite(account_id, vehicle_id) {
    try {
      const sql = `
        SELECT favorite_id FROM favorite_vehicles 
        WHERE account_id = $1 AND vehicle_id = $2
        LIMIT 1
      `;
      
      const result = await pool.query(sql, [account_id, vehicle_id]);
      return result.rows.length > 0;
      
    } catch (error) {
      console.error('Check favorite error:', error.message);
      return false;
    }
  }

  /* ***************************
   * GET USER'S FAVORITE VEHICLES
   * Returns array of favorite vehicles with details
   * Includes pagination support
   * ************************** */
  static async getUserFavorites(account_id, limit = 20, offset = 0) {
    try {
      const sql = `
        SELECT 
          f.favorite_id,
          f.notes,
          f.priority,
          f.created_at,
          i.inv_id,
          i.inv_make,
          i.inv_model,
          i.inv_year,
          i.inv_price,
          i.inv_description,
          i.inv_image,
          i.inv_thumbnail,
          i.inv_color,
          i.inv_miles,
          c.classification_name,
          COUNT(*) OVER() as total_count
        FROM favorite_vehicles f
        JOIN inventory i ON f.vehicle_id = i.inv_id
        JOIN classification c ON i.classification_id = c.classification_id
        WHERE f.account_id = $1
        ORDER BY 
          f.priority DESC,
          f.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(sql, [account_id, limit, offset]);
      
      return {
        success: true,
        favorites: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
        limit: limit,
        offset: offset
      };
      
    } catch (error) {
      console.error('Get user favorites error:', error.message);
      return {
        success: false,
        favorites: [],
        total: 0,
        error: error.message
      };
    }
  }

  /* ***************************
   * GET FAVORITE COUNT FOR A VEHICLE
   * Returns number of users who favorited this vehicle
   * ************************** */
  static async getVehicleFavoriteCount(vehicle_id) {
    try {
      const sql = `
        SELECT COUNT(*) as favorite_count 
        FROM favorite_vehicles 
        WHERE vehicle_id = $1
      `;
      
      const result = await pool.query(sql, [vehicle_id]);
      return parseInt(result.rows[0].favorite_count);
      
    } catch (error) {
      console.error('Get vehicle favorite count error:', error.message);
      return 0;
    }
  }

  /* ***************************
   * UPDATE FAVORITE NOTES
   * Allows users to add/edit notes about a favorited vehicle
   * ************************** */
  static async updateFavoriteNotes(account_id, vehicle_id, notes) {
    try {
      const errors = this.validateFavoriteData(account_id, vehicle_id);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.msg).join(', ')}`);
      }

      // Validate notes length
      if (notes && notes.length > 500) {
        throw new Error('Notes cannot exceed 500 characters');
      }

      const sql = `
        UPDATE favorite_vehicles 
        SET notes = $3 
        WHERE account_id = $1 AND vehicle_id = $2
        RETURNING favorite_id
      `;
      
      const result = await pool.query(sql, [account_id, vehicle_id, notes]);
      
      return {
        success: result.rowCount > 0,
        updated: result.rowCount > 0
      };
      
    } catch (error) {
      console.error('Update favorite notes error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /* ***************************
   * UPDATE FAVORITE PRIORITY
   * Allows users to set priority (1-5)
   * ************************** */
  static async updateFavoritePriority(account_id, vehicle_id, priority) {
    try {
      const errors = this.validateFavoriteData(account_id, vehicle_id);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.msg).join(', ')}`);
      }

      // Validate priority range
      if (priority < 1 || priority > 5) {
        throw new Error('Priority must be between 1 and 5');
      }

      const sql = `
        UPDATE favorite_vehicles 
        SET priority = $3 
        WHERE account_id = $1 AND vehicle_id = $2
        RETURNING favorite_id
      `;
      
      const result = await pool.query(sql, [account_id, vehicle_id, priority]);
      
      return {
        success: result.rowCount > 0,
        updated: result.rowCount > 0
      };
      
    } catch (error) {
      console.error('Update favorite priority error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /* ***************************
   * GET USER'S FAVORITE STATS
   * Returns statistics about user's favorites
   * ************************** */
  static async getUserFavoriteStats(account_id) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_favorites,
          AVG(priority) as average_priority,
          MAX(created_at) as last_added,
          MIN(created_at) as first_added,
          COUNT(DISTINCT EXTRACT(MONTH FROM created_at)) as months_active
        FROM favorite_vehicles 
        WHERE account_id = $1
      `;
      
      const result = await pool.query(sql, [account_id]);
      
      return {
        success: true,
        stats: result.rows[0] || {}
      };
      
    } catch (error) {
      console.error('Get user favorite stats error:', error.message);
      return {
        success: false,
        stats: {},
        error: error.message
      };
    }
  }

  /* ***************************
   * CHECK IF USER CAN ADD MORE FAVORITES
   * Prevents abuse by limiting favorites per user
   * ************************** */
  static async canAddMoreFavorites(account_id) {
    try {
      const MAX_FAVORITES = 50; // Reasonable limit
      const sql = `
        SELECT COUNT(*) as favorite_count 
        FROM favorite_vehicles 
        WHERE account_id = $1
      `;
      
      const result = await pool.query(sql, [account_id]);
      const count = parseInt(result.rows[0].favorite_count);
      
      return {
        canAdd: count < MAX_FAVORITES,
        currentCount: count,
        maxAllowed: MAX_FAVORITES,
        remaining: MAX_FAVORITES - count
      };
      
    } catch (error) {
      console.error('Check favorite limit error:', error.message);
      return {
        canAdd: true, // Fail open - allow adding if check fails
        currentCount: 0,
        maxAllowed: 50,
        remaining: 50
      };
    }
  }

  /* ***************************
   * GET RECENT FAVORITES FOR DASHBOARD
   * Returns limited number of recent favorites
   * ************************** */
  static async getRecentFavorites(account_id, limit = 5) {
    try {
      const sql = `
        SELECT 
          f.created_at,
          i.inv_id,
          i.inv_make,
          i.inv_model,
          i.inv_year,
          i.inv_thumbnail,
          c.classification_name
        FROM favorite_vehicles f
        JOIN inventory i ON f.vehicle_id = i.inv_id
        JOIN classification c ON i.classification_id = c.classification_id
        WHERE f.account_id = $1
        ORDER BY f.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(sql, [account_id, limit]);
      
      return {
        success: true,
        favorites: result.rows
      };
      
    } catch (error) {
      console.error('Get recent favorites error:', error.message);
      return {
        success: false,
        favorites: [],
        error: error.message
      };
    }
  }
}

module.exports = FavoriteModel;