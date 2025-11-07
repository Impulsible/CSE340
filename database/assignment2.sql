-- =============================================
-- CSE 340 - ASSIGNMENT 2 - TASK 1 QUERIES
-- =============================================

-- TASK 1.1: Insert Tony Stark record
SELECT '=== TASK 1.1: Insert Tony Stark ===' as task;
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');
SELECT 'Tony Stark inserted successfully' as result;

-- TASK 1.2: Modify Tony Stark record to change account_type to "Admin"
SELECT '=== TASK 1.2: Update Tony Stark to Admin ===' as task;
UPDATE account 
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
SELECT 'Tony Stark updated to Admin successfully' as result;

-- TASK 1.3: Delete Tony Stark record from the database
SELECT '=== TASK 1.3: Delete Tony Stark ===' as task;
DELETE FROM account 
WHERE account_email = 'tony@starkent.com';
SELECT 'Tony Stark deleted sucessfully' as result;

-- TASK 1.4: Modify "GM Hummer" record description
SELECT '=== TASK 1.4: Update Hummer Description ===' as task;
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';
SELECT 'Hummer description updated successfully' as result;

-- TASK 1.5: Inner join for Sport category vehicles
SELECT '=== TASK 1.5: Sport Category Vehicles ===' as task;
SELECT inv_make, inv_model, classification_name
FROM inventory
INNER JOIN classification 
ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- TASK 1.6: Update image paths to include "/vehicles"
SELECT '=== TASK 1.6: Update Image Paths ===' as task;
UPDATE inventory 
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
SELECT 'Image paths updated successfully' as result;

-- =============================================
-- TASK 1 COMPLETION VERIFICATION
-- =============================================

SELECT '=== ALL TASK 1 QUERIES COMPLETED ===' as final_status;

-- Verify Tony Stark was deleted
SELECT 'Tony Stark Verification:' as check;
SELECT * FROM account WHERE account_email = 'tony@starkent.com';

-- Verify Hummer description
SELECT 'Hummer Description Verification:' as check;
SELECT inv_description FROM inventory 
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Verify Sport vehicles exist
SELECT 'Sport Vehicles Count:' as check;
SELECT COUNT(*) as sport_vehicle_count 
FROM inventory
INNER JOIN classification 
ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';