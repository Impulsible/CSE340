// inventory-model.js - REAL DATABASE OPERATIONS
const pool = require("../database/");

const invModel = {
  // Add new classification - REAL DATABASE
  addClassification: async (classification_name) => {
    try {
      console.log(`📝 Database: Adding new classification '${classification_name}'`);
      
      const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
      const result = await pool.query(sql, [classification_name]);
      
      console.log(`✅ Database: Classification '${classification_name}' added successfully with ID ${result.rows[0].classification_id}`);
      return result;
    } catch (error) {
      console.error("Error adding classification:", error);
      throw error;
    }
  },

  // Add new inventory item - REAL DATABASE
  addInventory: async (invData) => {
    try {
      console.log(`📝 Database: Adding new inventory item '${invData.inv_make} ${invData.inv_model}'`);
      
      const sql = `INSERT INTO inventory (
        inv_make, inv_model, inv_year, inv_description, 
        inv_image, inv_thumbnail, inv_price, inv_miles, 
        inv_color, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
      
      const result = await pool.query(sql, [
        invData.inv_make,
        invData.inv_model,
        invData.inv_year,
        invData.inv_description,
        invData.inv_image || "/images/vehicles/no-image.jpg",
        invData.inv_thumbnail || "/images/vehicles/no-image-tn.jpg",
        invData.inv_price,
        invData.inv_miles,
        invData.inv_color,
        invData.classification_id
      ]);
      
      console.log(`✅ Database: Inventory item '${invData.inv_make} ${invData.inv_model}' added successfully with ID ${result.rows[0].inv_id}`);
      return result;
    } catch (error) {
      console.error("Error adding inventory:", error);
      throw error;
    }
  },

  getClassifications: async () => {
    try {
      const sql = "SELECT * FROM classification ORDER BY classification_name";
      return await pool.query(sql);
    } catch (error) {
      console.error("Error getting classifications:", error);
      throw error;
    }
  },

  getInventoryByClassificationId: async (classification_id) => {
    try {
      console.log(`📊 Database: Getting vehicles for classification ${classification_id}`);
      
      const sql = ` 
        SELECT * FROM inventory 
        WHERE classification_id = $1 
        ORDER BY inv_make, inv_model
      `;
      const result = await pool.query(sql, [classification_id]);
      
      console.log(`📊 Database: Found ${result.rows.length} vehicles for classification ${classification_id}`);
      return result.rows;
    } catch (error) {
      console.error("Error getting inventory by classification:", error);
      throw error;
    }
  },

  getVehicleDetailById: async (inv_id) => {
    try {
      console.log(`🔍 Database: Getting vehicle details for ID ${inv_id}`);
      
      const sql = `
        SELECT 
          i.*,
          c.classification_name
        FROM inventory i
        JOIN classification c ON i.classification_id = c.classification_id
        WHERE i.inv_id = $1
      `;
      const result = await pool.query(sql, [inv_id]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Database: Found vehicle ${result.rows[0].inv_make} ${result.rows[0].inv_model}`);
        return result.rows[0];
      } else {
        console.log(`❌ Database: No vehicle found with ID ${inv_id}`);
        return null;
      }
    } catch (error) {
      console.error("Error getting vehicle detail:", error);
      throw error;
    }
  },

  /* ***************************
   * Get inventory item by ID - ADDED FOR EDIT FUNCTIONALITY
   * ************************** */
  getInventoryById: async (inv_id) => {
    try {
      console.log(`🔍 Database: Getting inventory item for editing ID ${inv_id}`);
      
      const sql = `SELECT * FROM inventory WHERE inv_id = $1`;
      const result = await pool.query(sql, [inv_id]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Database: Found inventory item ${result.rows[0].inv_make} ${result.rows[0].inv_model} for editing`);
        return result.rows[0];
      } else {
        console.log(`❌ Database: No inventory item found with ID ${inv_id}`);
        return null;
      }
    } catch (error) {
      console.error("Error getting inventory by ID:", error);
      throw error;
    }
  },

  /* ***************************
   *  Update Inventory Data
   * ************************** */
  updateInventory: async (
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  ) => {
    try {
      console.log(`📝 Database: Updating inventory item ID ${inv_id} - ${inv_make} ${inv_model}`);
      
      const sql = `UPDATE inventory 
        SET inv_make = $1, 
            inv_model = $2, 
            inv_description = $3, 
            inv_image = $4, 
            inv_thumbnail = $5, 
            inv_price = $6, 
            inv_year = $7, 
            inv_miles = $8, 
            inv_color = $9, 
            classification_id = $10 
        WHERE inv_id = $11 
        RETURNING *`;
        
      const data = await pool.query(sql, [
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
        inv_id
      ]);
      
      if (data.rows.length > 0) {
        console.log(`✅ Database: Successfully updated inventory item ID ${inv_id} - ${inv_make} ${inv_model}`);
        return data.rows[0];
      } else {
        console.log(`❌ Database: No inventory item found with ID ${inv_id} to update`);
        return null;
      }
    } catch (error) {
      console.error("model error: " + error);
      throw error;
    }
  },

  /* ***************************
   *  Delete Inventory Item
   * ************************** */
  deleteInventoryItem: async (inv_id) => {
    try {
      console.log(`🗑️ Database: Deleting inventory item ID ${inv_id}`);
      
      const sql = "DELETE FROM inventory WHERE inv_id = $1 RETURNING *";
      const result = await pool.query(sql, [inv_id]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Database: Successfully deleted inventory item ID ${inv_id}`);
        return true;
      } else {
        console.log(`❌ Database: No inventory item found with ID ${inv_id}`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }
  }, // <-- ADDED COMMA HERE

  /* ***************************
   *  Save Contact Submission to Database
   * ************************** */
  saveContactSubmission: async (contactData) => {
    try {
      console.log(`📝 Database: Saving contact submission from ${contactData.name} (${contactData.email})`);
      
      const sql = `INSERT INTO contact_submissions 
                   (name, email, phone, subject, message, vehicle_id, preferred_contact, newsletter) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                   RETURNING *`;
      
      const result = await pool.query(sql, [
        contactData.name,
        contactData.email,
        contactData.phone || null,
        contactData.subject || null,
        contactData.message,
        contactData.vehicle_id || null,
        contactData.preferred_contact || 'email',
        contactData.newsletter || false
      ]);
      
      console.log(`✅ Database: Contact submission saved successfully with ID ${result.rows[0].contact_id}`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Database: Error saving contact submission:", error);
      throw error;
    }
  },

  /* ***************************
   *  Get Contact Submissions (for admin view)
   * ************************** */
  getContactSubmissions: async () => {
    try {
      console.log(`📊 Database: Getting all contact submissions`);
      
      const sql = `SELECT cs.*, i.inv_make, i.inv_model, i.inv_year 
                   FROM contact_submissions cs
                   LEFT JOIN inventory i ON cs.vehicle_id = i.inv_id
                   ORDER BY cs.created_at DESC`;
      
      const result = await pool.query(sql);
      console.log(`📊 Database: Found ${result.rows.length} contact submissions`);
      return result.rows;
    } catch (error) {
      console.error("❌ Database: Error getting contact submissions:", error);
      throw error;
    }
  },

  /* ***************************
   *  Get Contact Submission by ID
   * ************************** */
  getContactSubmissionById: async (contact_id) => {
    try {
      console.log(`🔍 Database: Getting contact submission ID ${contact_id}`);
      
      const sql = `SELECT cs.*, i.inv_make, i.inv_model, i.inv_year 
                   FROM contact_submissions cs
                   LEFT JOIN inventory i ON cs.vehicle_id = i.inv_id
                   WHERE cs.contact_id = $1`;
      
      const result = await pool.query(sql, [contact_id]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Database: Found contact submission ID ${contact_id}`);
        return result.rows[0];
      } else {
        console.log(`❌ Database: No contact submission found with ID ${contact_id}`);
        return null;
      }
    } catch (error) {
      console.error("❌ Database: Error getting contact submission by ID:", error);
      throw error;
    }
  },

  /* ***************************
   *  Delete Contact Submission
   * ************************** */
  deleteContactSubmission: async (contact_id) => {
    try {
      console.log(`🗑️ Database: Deleting contact submission ID ${contact_id}`);
      
      const sql = "DELETE FROM contact_submissions WHERE contact_id = $1 RETURNING *";
      const result = await pool.query(sql, [contact_id]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Database: Successfully deleted contact submission ID ${contact_id}`);
        return true;
      } else {
        console.log(`❌ Database: No contact submission found with ID ${contact_id}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Database: Error deleting contact submission:", error);
      throw error;
    }
  },

  /* ***************************
   *  Mark Contact Submission as Read
   * ************************** */
  markContactAsRead: async (contact_id) => {
    try {
      console.log(`📋 Database: Marking contact submission ID ${contact_id} as read`);
      
      const sql = "UPDATE contact_submissions SET is_read = true WHERE contact_id = $1 RETURNING *";
      const result = await pool.query(sql, [contact_id]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Database: Successfully marked contact submission ID ${contact_id} as read`);
        return result.rows[0];
      } else {
        console.log(`❌ Database: No contact submission found with ID ${contact_id}`);
        return null;
      }
    } catch (error) {
      console.error("❌ Database: Error marking contact as read:", error);
      throw error;
    }
  },

  /* ***************************
   *  Get Contact Statistics
   * ************************** */
  getContactStatistics: async () => {
    try {
      console.log(`📈 Database: Getting contact statistics`);
      
      const sql = `
        SELECT 
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_submissions,
          COUNT(CASE WHEN vehicle_id IS NOT NULL THEN 1 END) as with_vehicle,
          COUNT(CASE WHEN newsletter = true THEN 1 END) as newsletter_subscribers,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_submissions
        FROM contact_submissions
      `;
      
      const result = await pool.query(sql);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Database: Error getting contact statistics:", error);
      throw error;
    }
  }
};

module.exports = invModel;