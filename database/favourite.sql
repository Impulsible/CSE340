-- ============================================
-- ENSURE VIEWS ARE CREATED FOR FAVORITES SYSTEM
-- ============================================

-- 1. DROP EXISTING VIEWS FIRST (if they exist)
DROP VIEW IF EXISTS public.user_favorites_summary;
DROP VIEW IF EXISTS public.popular_vehicles;

-- 2. CREATE VIEW FOR USER FAVORITES SUMMARY
CREATE OR REPLACE VIEW public.user_favorites_summary AS
SELECT 
    a.account_id,
    a.account_firstname,
    a.account_lastname,
    a.account_email,
    COUNT(f.favorite_id) as total_favorites,
    MAX(f.created_at) as last_favorite_date
FROM account a
LEFT JOIN favorite_vehicles f ON a.account_id = f.account_id
GROUP BY a.account_id, a.account_firstname, a.account_lastname, a.account_email;

-- 3. CREATE VIEW FOR POPULAR VEHICLES
CREATE OR REPLACE VIEW public.popular_vehicles AS
SELECT 
    i.inv_id,
    i.inv_make,
    i.inv_model,
    i.inv_year,
    i.inv_price,
    i.inv_thumbnail,
    COUNT(f.favorite_id) as favorite_count
FROM inventory i
LEFT JOIN favorite_vehicles f ON i.inv_id = f.vehicle_id
GROUP BY i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail
ORDER BY favorite_count DESC;

-- 4. TEST THE VIEWS
SELECT 'VIEWS CREATED SUCCESSFULLY' as status;
SELECT * FROM user_favorites_summary LIMIT 5;
SELECT * FROM popular_vehicles LIMIT 5;


-- Create the favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorite_vehicles (
    favorite_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    notes TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES inventory(inv_id) ON DELETE CASCADE,
    UNIQUE(account_id, vehicle_id)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_account_id ON favorite_vehicles(account_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vehicle_id ON favorite_vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorite_vehicles(created_at DESC);