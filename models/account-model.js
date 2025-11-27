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
      hashedPassword,  // Now using hashed password
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

  static async findById(accountId) {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, 
             account_email, account_type 
      FROM account 
      WHERE account_id = $1
    `;

    const result = await pool.query(sql, [accountId]);
    return result.rows[0];
  }

  static async verifyPassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateAccount(accountId, updateData) {
    const { account_firstname, account_lastname, account_email } = updateData;
    
    const sql = `
      UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4 
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;

    const result = await pool.query(sql, [
      account_firstname, 
      account_lastname, 
      account_email, 
      accountId
    ]);

    return result.rows[0];
  }

  static async changePassword(accountId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const sql = `
      UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2
    `;

    await pool.query(sql, [hashedPassword, accountId]);
  }
}

// Export both the existing function and the new model
module.exports = { 
  registerAccount,
  AccountModel 
};