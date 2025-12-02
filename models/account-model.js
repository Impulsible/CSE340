const pool = require("../database/");
const bcrypt = require('bcryptjs');

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(account_password, 12);

    const sql = `
      INSERT INTO account 
        (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES 
        ($1, $2, $3, $4, 'Client') 
      RETURNING *
    `
    
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ])

    return result
  } catch (error) {
    console.error("Database Insert Error:", error)
    throw error
  }
}

class AccountModel {
  static async createAccount(accountData) {
    const { 
      account_firstname, 
      account_lastname, 
      account_email, 
      account_password 
    } = accountData;

    // Hash password
    const hashedPassword = await bcrypt.hash(account_password, 12);

    const sql = `
      INSERT INTO account (
        account_firstname, 
        account_lastname, 
        account_email, 
        account_password, 
        account_type
      ) VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;

    const result = await pool.query(sql, [
      account_firstname, 
      account_lastname, 
      account_email, 
      hashedPassword
    ]);

    return result.rows[0];
  }

  static async findByEmail(email) {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_password, account_type 
      FROM account 
      WHERE account_email = $1
    `;

    const result = await pool.query(sql, [email]);
    return result.rows[0];
  }

  /* ****************************************
   * TASK 5: Function to get account by ID
   * *************************************** */
  static async findById(accountId) {
    try {
      const sql = `
        SELECT account_id, account_firstname, account_lastname, 
               account_email, account_type 
        FROM account 
        WHERE account_id = $1
      `;

      const result = await pool.query(sql, [accountId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  static async verifyPassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  /* ****************************************
   * TASK 5: Function to update account info - SIMPLIFIED
   * *************************************** */
  static async updateAccountInfo(accountId, account_firstname, account_lastname, account_email) {
    try {
      // SIMPLIFIED SQL - no account_updated column to avoid errors
      const sql = `
        UPDATE account 
        SET account_firstname = $1, 
            account_lastname = $2, 
            account_email = $3
        WHERE account_id = $4 
        RETURNING account_id, account_firstname, account_lastname, account_email, account_type
      `;

      console.log('📊 Executing SQL:', sql);
      console.log('📊 With values:', [account_firstname, account_lastname, account_email, accountId]);

      const result = await pool.query(sql, [
        account_firstname, 
        account_lastname, 
        account_email, 
        accountId
      ]);

      console.log('📊 Database result:', result.rows);

      if (result.rows.length === 0) {
        console.log('❌ No rows updated - account not found');
        return null;
      }

      console.log('✅ Database update successful:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error in updateAccountInfo:', error.message);
      console.error('Error details:', error);
      throw error;
    }
  }

  /* ****************************************
   * TASK 5: Function to update password - SIMPLIFIED
   * *************************************** */
  static async updatePassword(accountId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const sql = `
        UPDATE account 
        SET account_password = $1
        WHERE account_id = $2
        RETURNING account_id
      `;

      const result = await pool.query(sql, [hashedPassword, accountId]);
      
      if (result.rows.length === 0) {
        console.log('❌ No rows updated for password - account not found');
        return false;
      }
      
      console.log('✅ Password update successful');
      return true;
    } catch (error) {
      console.error('❌ Error in updatePassword:', error.message);
      throw error;
    }
  }

  /* ****************************************
   * Function to check if email exists (for validation)
   * *************************************** */
  static async emailExists(email, excludeAccountId = null) {
    try {
      let sql = `
        SELECT account_id, account_email 
        FROM account 
        WHERE account_email = $1
      `;
      
      let params = [email];
      
      if (excludeAccountId) {
        sql += ` AND account_id != $2`;
        params.push(excludeAccountId);
      }
      
      const result = await pool.query(sql, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in emailExists:', error);
      return false;
    }
  }
}

// Export both the existing function and the new model
module.exports = { 
  registerAccount,
  AccountModel 
};