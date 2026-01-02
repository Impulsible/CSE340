-- ============================================
-- COMPLETE DATABASE SETUP FOR VEHICLE INVENTORY
-- ============================================

-- 1. DISABLE NOTICE MESSAGES (optional, makes output cleaner)
SET client_min_messages TO WARNING;

-- 2. DROP TABLES IF THEY EXIST (in correct order due to foreign keys)
-- Drop views first
DROP VIEW IF EXISTS public.inventory_summary CASCADE;
DROP VIEW IF EXISTS public.popular_vehicles CASCADE;
DROP VIEW IF EXISTS public.user_favorites_summary CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS favorite_vehicles CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;

-- 3. CREATE CLASSIFICATION TABLE
CREATE TABLE classification (
  classification_id INTEGER PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL UNIQUE
);

-- 4. CREATE INVENTORY TABLE
CREATE TABLE inventory (
  inv_id INTEGER PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_year INTEGER NOT NULL CHECK (inv_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  inv_description TEXT NOT NULL,
  inv_image VARCHAR(255) NOT NULL,
  inv_thumbnail VARCHAR(255) NOT NULL,
  inv_price NUMERIC(10,2) NOT NULL CHECK (inv_price >= 0),
  inv_miles INTEGER NOT NULL CHECK (inv_miles >= 0),
  inv_color VARCHAR(50) NOT NULL,
  classification_id INTEGER NOT NULL REFERENCES classification(classification_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE ACCOUNT TABLE
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) NOT NULL UNIQUE,
  account_password VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Admin', 'Employee', 'Client')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- 6. CREATE CONTACT_SUBMISSIONS TABLE (mentioned in your error)
CREATE TABLE contact_submissions (
  submission_id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES account(account_id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES inventory(inv_id) ON DELETE SET NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20),
  message TEXT NOT NULL,
  submission_type VARCHAR(50) CHECK (submission_type IN ('question', 'test_drive', 'quote_request', 'general')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. CREATE FAVORITE_VEHICLES TABLE (EXACTLY AS YOU REQUESTED)
CREATE TABLE favorite_vehicles (
    favorite_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
    notes TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, vehicle_id)
);

-- 8. CREATE TRIGGER FUNCTION FOR UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. CREATE TRIGGER FOR INVENTORY UPDATED_AT
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. INSERT CLASSIFICATION DATA
INSERT INTO classification (classification_id, classification_name) VALUES 
(1, 'Custom'),
(2, 'Sport'), 
(3, 'SUV'),
(4, 'Truck'),
(5, 'Sedan')
ON CONFLICT (classification_id) DO NOTHING;

-- 11. INSERT INVENTORY DATA
INSERT INTO inventory (
  inv_id, inv_make, inv_model, inv_year, inv_description, 
  inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
) VALUES 
-- SPORT CARS (classification_id: 2)
(
  1, 'Chevy', 'Camaro', 2018, 
  'Experience the thrill of driving with this 2018 Chevy Camaro. With its powerful engine and sleek silver exterior, this sport edition delivers exceptional performance at an affordable price. Perfect for those who want to make a statement on the road while enjoying the reliability of a modern sports car with low mileage and premium features.',
  '/images/vehicles/camaro.jpg', '/images/vehicles/camaro-tn.jpg', 25000.00, 10122, 'Black', 2
),
(
  2, 'Ford', 'Mustang', 2020,
  'The iconic 2020 Ford Mustang combines classic American muscle with modern technology. This vibrant red sports car features advanced safety systems, premium interior amenities, and a powerful engine that delivers exhilarating performance. With low mileage and meticulous maintenance, this Mustang offers both style and substance for driving enthusiasts seeking an authentic muscle car experience.',
  '/images/vehicles/mustang.jpg', '/images/vehicles/mustang-tn.jpg', 32000.00, 8500, 'Red', 2
),
(
  3, 'Dodge', 'Charger', 2021,
  'The 2021 Dodge Charger delivers impressive performance with its powerful engine and aggressive styling. This sleek black sedan offers a comfortable interior, advanced technology features, and exceptional handling for daily commuting or long-distance travel.',
  '/images/vehicles/charger.jpg', '/images/vehicles/charger-tn.jpg', 35000.00, 12000, 'Black', 2
),
(
  7, 'Lamborghini', 'Adventador', 2023,
  'Experience automotive excellence with the 2023 Lamborghini Adventador, a masterpiece of Italian engineering. This vibrant orange supercar features a powerful V12 engine, advanced aerodynamics, and cutting-edge technology that delivers unparalleled performance. With extremely low mileage and pristine condition, this Adventador represents the pinnacle of supercar design for discerning collectors.',
  '/images/vehicles/adventador.jpg', '/images/vehicles/adventador-tn.jpg', 507000.00, 1234, 'Orange', 2
),

-- SUV VEHICLES (classification_id: 3)
(
  4, 'GM', 'Hummer', 2016,
  'The 2016 GM Hummer combines rugged capability with spacious comfort. This distinctive yellow SUV features impressive off-road capabilities while providing ample interior space for passengers and cargo. With its powerful engine and durable construction, this Hummer is perfect for adventurous families or outdoor enthusiasts who demand both performance and practicality.',
  '/images/vehicles/hummer.jpg', '/images/vehicles/hummer-tn.jpg', 58800.00, 48563, 'Yellow', 3
),
(
  5, 'Jeep', 'Wrangler', 2022,
  'The 2022 Jeep Wrangler is built for adventure with its legendary off-road capabilities and removable top. This green SUV features advanced 4x4 systems, durable construction, and modern amenities for both city driving and outdoor exploration.',
  '/images/vehicles/wrangler.jpg', '/images/vehicles/wrangler-tn.jpg', 42000.00, 7500, 'Green', 3
),
(
  10, 'Cadillac', 'Escalade', 2023,
  'The 2023 Cadillac Escalade redefines luxury SUV standards with its sophisticated black exterior and premium amenities. This vehicle offers an exceptionally comfortable ride with advanced technology features, spacious three-row seating, and superior craftsmanship throughout. With very low mileage and meticulous care, this Escalade provides the ultimate in luxury transportation.',
  '/images/vehicles/escalade.jpg', '/images/vehicles/escalade-tn.jpg', 89990.00, 3450, 'Black', 3
),
(
  11, 'Custom', 'Surf Van', 2020,
  'This 2020 Custom Surf Van is the perfect companion for beach adventures and road trips. Featuring a comfortable sleeping area, compact kitchenette, and specialized surfboard storage, this blue and white van is designed for outdoor enthusiasts. With moderate mileage and custom modifications, it offers both practicality and style for those who love coastal exploration.',
  '/images/vehicles/survan.jpg', '/images/vehicles/survan-tn.jpg', 68500.00, 23450, 'Blue/White', 3
),

-- SEDAN VEHICLES (classification_id: 5)
(
  8, 'Toyota', 'Camry', 2022,
  'The 2022 Toyota Camry offers exceptional reliability, fuel efficiency, and comfort. This silver sedan features advanced safety systems, a spacious interior, and smooth handling, making it perfect for daily commuting and family travel.',
  '/images/vehicles/camry.jpg', '/images/vehicles/camry-tn.jpg', 28000.00, 15000, 'Silver', 5
),
(
  12, 'Ford', 'Crown Victoria', 2013,
  'The 2013 Ford Crown Victoria offers legendary reliability and spacious comfort in a classic sedan package. This white former police vehicle features durable construction, powerful performance, and practical design. With moderate mileage and professional maintenance history, this Crown Victoria provides exceptional value for those seeking a dependable and roomy family sedan.',
  '/images/vehicles/crwn-vic.jpg', '/images/vehicles/crwn-vic-tn.jpg', 25000.00, 25578, 'White', 5
),

-- TRUCK VEHICLES (classification_id: 4)
(
  9, 'Ford', 'F-150', 2021,
  'The 2021 Ford F-150 combines tough capability with advanced technology. This blue pickup truck offers powerful towing capacity, versatile cargo space, and a comfortable interior with the latest connectivity features for work or adventure.',
  '/images/vehicles/f150.jpg', '/images/vehicles/f150-tn.jpg', 45000.00, 22000, 'Blue', 4
),
(
  13, 'Emergency', 'Fire Truck', 2021,
  'This professional-grade 2021 Emergency Fire Truck is equipped with state-of-the-art firefighting technology and safety features. The bright red vehicle includes a powerful water pump, extensive hose systems, and advanced communication equipment. With low mileage and meticulous maintenance, this fire truck is ideal for municipal departments or industrial facilities requiring reliable emergency response capability.',
  '/images/vehicles/fire-truck.jpg', '/images/vehicles/fire-truck-tn.jpg', 650000.00, 8765, 'Red', 4
),
(
  14, 'Mobile', 'Mechanic Truck', 2022,
  'The 2022 Mobile Mechanic Truck is a fully-equipped service vehicle designed for professional automotive repair on the go. This white truck features comprehensive tool storage, diagnostic equipment, and workbench space. With moderate mileage and professional maintenance, it''s perfect for roadside assistance companies or mobile repair services seeking reliable and efficient operation.',
  '/images/vehicles/mechanic.jpg', '/images/vehicles/mechanic-tn.jpg', 85000.00, 12340, 'White', 4
),
(
  15, 'Grave Digger', 'Monster Truck', 2021,
  'Experience extreme power with the 2021 Grave Digger Monster Truck, featuring massive 66-inch tires and custom suspension. This black and green beast is equipped with a supercharged engine capable of incredible performance in competition or exhibition events. With very low mileage and professional maintenance, it offers enthusiasts the ultimate monster truck experience.',
  '/images/vehicles/monster-truck.jpg', '/images/vehicles/monster-truck-tn.jpg', 250000.00, 560, 'Black/Green', 4
),

-- CUSTOM VEHICLES (classification_id: 1)
(
  6, 'Ford', 'Model T Touring', 1919,
  'A beautifully restored 1919 Ford Model T Touring, showcasing the iconic engineering that shaped early automotive history. Featuring wooden-spoke wheels, an open-top touring body, and authentic period details, this Model T offers collectors and vintage-car enthusiasts a rare opportunity to own a timeless classic.',
  '/images/vehicles/model-t.jpg', '/images/vehicles/model-t-tn.jpg', 24500.00, 8120, 'Gloss Black', 1
),
(
  16, 'Batmobile', 'Custom', 2021,
  'The 2021 Batmobile Custom offers a unique driving experience with its innovative design and special features. This black custom vehicle includes transforming capabilities and advanced technology systems. With low mileage and careful maintenance, this one-of-a-kind creation provides both performance and novelty for automotive enthusiasts seeking something truly extraordinary.',
  '/images/vehicles/batmobile.jpg', '/images/vehicles/batmobile-tn.jpg', 65000.00, 2987, 'Black', 1
),
(
  17, 'Aero', 'Car Concept', 2022,
  'The 2022 Aero Car Concept represents cutting-edge automotive design with its revolutionary aerodynamic shape and advanced technology. This silver concept vehicle features innovative materials and engineering solutions that maximize efficiency and performance. With extremely low mileage and pristine condition, it offers a glimpse into the future of automotive transportation.',
  '/images/vehicles/aerocar.jpg', '/images/vehicles/aerocar-tn.jpg', 325000.00, 890, 'Silver', 1
),
(
  18, 'Mystery', 'Machine', 1978,
  'This iconic 1978 Mystery Machine has been meticulously restored to its original psychedelic glory. The green and blue custom van features unique interior modifications and nostalgic charm. With careful preservation and moderate mileage, this pop culture artifact offers both functional transportation and collector appeal for enthusiasts of automotive history.',
  '/images/vehicles/mystery-van.jpg', '/images/vehicles/mystery-van-tn.jpg', 125000.00, 45670, 'Green/Blue', 1
),
(
  19, 'Custom', 'Dog Mobile', 2022,
  'The 2022 Custom Dog Mobile is specially designed for pet owners who travel with their furry companions. This multi-color vehicle features secure kennels, feeding stations, and climate control systems to ensure pet comfort and safety. With low mileage and thoughtful design, it provides the perfect solution for pet transportation needs.',
  '/images/vehicles/dog-car.jpg', '/images/vehicles/dog-car-tn.jpg', 45000.00, 8900, 'Multi-color', 1
)
ON CONFLICT (inv_id) DO NOTHING;

-- 12. INSERT SAMPLE ACCOUNT DATA
INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES
('Admin', 'User', 'admin@phpmotors.com', '$2y$10$NkX6h.QE7l4U2h5Lw5p.8u7J3KzL9M2N1B0V8C6A5D7F9G2H1J3K5L7M9N0P2Q', 'Admin'),
('John', 'Doe', 'john@phpmotors.com', '$2y$10$NkX6h.QE7l4U2h5Lw5p.8u7J3KzL9M2N1B0V8C6A5D7F9G2H1J3K5L7M9N0P2Q', 'Client'),
('Jane', 'Smith', 'jane@phpmotors.com', '$2y$10$NkX6h.QE7l4U2h5Lw5p.8u7J3KzL9M2N1B0V8C6A5D7F9G2H1J3K5L7M9N0P2Q', 'Employee'),
('Bob', 'Johnson', 'bob@phpmotors.com', '$2y$10$NkX6h.QE7l4U2h5Lw5p.8u7J3KzL9M2N1B0V8C6A5D7F9G2H1J3K5L7M9N0P2Q', 'Client')
ON CONFLICT (account_email) DO NOTHING;

-- 13. INSERT SAMPLE FAVORITES DATA
INSERT INTO favorite_vehicles (account_id, vehicle_id, notes, priority) VALUES
(2, 1, 'Love this Camaro! Great price.', 1),
(2, 7, 'Dream car!', 5),
(2, 10, 'Luxury SUV for family trips', 3),
(3, 2, 'Mustang for weekend drives', 2),
(3, 4, 'Hummer for off-road adventures', 4),
(4, 1, 'Considering this as my first sports car', 2),
(4, 12, 'Reliable family sedan', 1),
(4, 16, 'Unique collectible', 5)
ON CONFLICT (account_id, vehicle_id) DO NOTHING;

-- 14. INSERT SAMPLE CONTACT SUBMISSIONS
INSERT INTO contact_submissions (account_id, vehicle_id, contact_name, contact_email, contact_phone, message, submission_type, status) VALUES
(2, 1, 'John Doe', 'john@phpmotors.com', '555-0101', 'I am interested in test driving the Camaro. What are your available times?', 'test_drive', 'new'),
(NULL, 7, 'Sarah Connor', 'sarah@example.com', '555-0202', 'Could you provide more details about the financing options for the Lamborghini?', 'quote_request', 'read'),
(3, 2, 'Jane Smith', 'jane@phpmotors.com', '555-0303', 'Does the Mustang come with an extended warranty option?', 'question', 'responded')
ON CONFLICT DO NOTHING;

-- 15. ADD INDEXES FOR BETTER PERFORMANCE
-- Indexes for inventory
CREATE INDEX idx_inventory_classification ON inventory(classification_id);
CREATE INDEX idx_inventory_year ON inventory(inv_year DESC);
CREATE INDEX idx_inventory_price ON inventory(inv_price);
CREATE INDEX idx_inventory_make_model ON inventory(inv_make, inv_model);

-- Indexes for account
CREATE INDEX idx_account_email ON account(account_email);
CREATE INDEX idx_account_type ON account(account_type);

-- Indexes for favorite_vehicles (EXACTLY AS YOU REQUESTED)
CREATE INDEX idx_favorites_account_id ON favorite_vehicles(account_id);
CREATE INDEX idx_favorites_vehicle_id ON favorite_vehicles(vehicle_id);
CREATE INDEX idx_favorites_created_at ON favorite_vehicles(created_at DESC);

-- Indexes for contact_submissions
CREATE INDEX idx_contact_account_id ON contact_submissions(account_id);
CREATE INDEX idx_contact_vehicle_id ON contact_submissions(vehicle_id);
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created_at ON contact_submissions(created_at DESC);

-- 16. CREATE VIEWS (EXACTLY AS YOU REQUESTED)
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

-- 17. TEST THE VIEWS (EXACTLY AS YOU REQUESTED)
SELECT 'VIEWS CREATED SUCCESSFULLY' as status;
SELECT * FROM user_favorites_summary LIMIT 5;
SELECT * FROM popular_vehicles LIMIT 5;

-- 18. FINAL VERIFICATION
SELECT 'DATABASE SETUP COMPLETE' as message;
SELECT 'Total classifications:' as item, COUNT(*)::text as count FROM classification
UNION ALL
SELECT 'Total vehicles:', COUNT(*)::text FROM inventory
UNION ALL
SELECT 'Total accounts:', COUNT(*)::text FROM account
UNION ALL
SELECT 'Total favorites:', COUNT(*)::text FROM favorite_vehicles
UNION ALL
SELECT 'Total contact submissions:', COUNT(*)::text FROM contact_submissions;

-- Reset message level
SET client_min_messages TO NOTICE;