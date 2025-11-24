-- Clear existing data to start fresh
DELETE FROM inventory;
DELETE FROM classification;

-- Insert classifications with specific IDs
INSERT INTO classification (classification_id, classification_name) VALUES 
(1, 'Custom'),
(2, 'Sport'), 
(3, 'SUV'),
(4, 'Truck'),
(5, 'Sedan')
ON CONFLICT (classification_id) DO NOTHING;

-- FIX: Reset classification sequence to ensure IDs match
SELECT setval('classification_classification_id_seq', (SELECT MAX(classification_id) FROM classification));

-- Insert inventory vehicles with SPECIFIC IDs that match your HTML links
INSERT INTO inventory (
  inv_id, inv_make, inv_model, inv_year, inv_description, 
  inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
) VALUES 
-- SPORT CARS (classification_id: 2)
(
  1, 'Chevy', 'Camaro', 2018, 
  'Experience the thrill of driving with this 2018 Chevy Camaro. With its powerful engine and sleek silver exterior, this sport edition delivers exceptional performance at an affordable price. Perfect for those who want to make a statement on the road while enjoying the reliability of a modern sports car with low mileage and premium features.',
  '/images/vehicles/camaro.jpg', '/images/vehicles/camaro-tn.jpg', 25000, 10122, 'Black', 2
),
(
  2, 'Ford', 'Mustang', 2020,
  'The iconic 2020 Ford Mustang combines classic American muscle with modern technology. This vibrant red sports car features advanced safety systems, premium interior amenities, and a powerful engine that delivers exhilarating performance. With low mileage and meticulous maintenance, this Mustang offers both style and substance for driving enthusiasts seeking an authentic muscle car experience.',
  '/images/vehicles/mustang.jpg', '/images/vehicles/wrangler-tn.jpg', 32000, 8500, 'Yellow', 2
),
(
  7, 'Lamborghini', 'Adventador', 2023,
  'Experience automotive excellence with the 2023 Lamborghini Adventador, a masterpiece of Italian engineering. This vibrant orange supercar features a powerful V12 engine, advanced aerodynamics, and cutting-edge technology that delivers unparalleled performance. With extremely low mileage and pristine condition, this Adventador represents the pinnacle of supercar design for discerning collectors.',
  '/images/vehicles/adventador.jpg', '/images/vehicles/adventador-tn.jpg', 507000, 1234, 'White', 2
),

-- SUV VEHICLES (classification_id: 3)
(
  4, 'GM', 'Hummer', 2016,
  'The 2016 GM Hummer combines rugged capability with spacious comfort. This distinctive yellow SUV features impressive off-road capabilities while providing ample interior space for passengers and cargo. With its powerful engine and durable construction, this Hummer is perfect for adventurous families or outdoor enthusiasts who demand both performance and practicality.',
  '/images/vehicles/hummer.jpg', '/images/vehicles/hummer-tn.jpg', 58800, 48563, 'Yellow', 3
),
(
  10, 'Cadillac', 'Escalade', 2023,
  'The 2023 Cadillac Escalade redefines luxury SUV standards with its sophisticated black exterior and premium amenities. This vehicle offers an exceptionally comfortable ride with advanced technology features, spacious three-row seating, and superior craftsmanship throughout. With very low mileage and meticulous care, this Escalade provides the ultimate in luxury transportation.',
  '/images/vehicles/escalade.jpg', '/images/vehicles/escalade-tn.jpg', 89990, 3450, 'Black', 3
),
(
  11, 'Custom', 'Surf Van', 2020,
  'This 2020 Custom Surf Van is the perfect companion for beach adventures and road trips. Featuring a comfortable sleeping area, compact kitchenette, and specialized surfboard storage, this blue and white van is designed for outdoor enthusiasts. With moderate mileage and custom modifications, it offers both practicality and style for those who love coastal exploration.',
  '/images/vehicles/survan.jpg', '/images/vehicles/survan-tn.jpg', 68500, 23450, 'Blue/White', 3
),

-- SEDAN VEHICLE (classification_id: 5)
(
  12, 'Ford', 'Crown Victoria', 2013,
  'The 2013 Ford Crown Victoria offers legendary reliability and spacious comfort in a classic sedan package. This white former police vehicle features durable construction, powerful performance, and practical design. With moderate mileage and professional maintenance history, this Crown Victoria provides exceptional value for those seeking a dependable and roomy family sedan.',
  '/images/vehicles/crwn-vic.jpg', '/images/vehicles/crwn-vic-tn.jpg', 25000, 25578, 'White', 5
),

-- TRUCK VEHICLES (classification_id: 4)
(
  13, 'Emergency', 'Fire Truck', 2021,
  'This professional-grade 2021 Emergency Fire Truck is equipped with state-of-the-art firefighting technology and safety features. The bright red vehicle includes a powerful water pump, extensive hose systems, and advanced communication equipment. With low mileage and meticulous maintenance, this fire truck is ideal for municipal departments or industrial facilities requiring reliable emergency response capability.',
  '/images/vehicles/fire-truck.jpg', '/images/vehicles/fire-truck-tn.jpg', 650000, 8765, 'Red', 4
),
(
  14, 'Mobile', 'Mechanic Truck', 2022,
  'The 2022 Mobile Mechanic Truck is a fully-equipped service vehicle designed for professional automotive repair on the go. This white truck features comprehensive tool storage, diagnostic equipment, and workbench space. With moderate mileage and professional maintenance, it''s perfect for roadside assistance companies or mobile repair services seeking reliable and efficient operation.',
  '/images/vehicles/mechanic.jpg', '/images/vehicles/mechanic-tn.jpg', 85000, 12340, 'White', 4
),
(
  15, 'Grave Digger', 'Monster Truck', 2021,
  'Experience extreme power with the 2021 Grave Digger Monster Truck, featuring massive 66-inch tires and custom suspension. This black and green beast is equipped with a supercharged engine capable of incredible performance in competition or exhibition events. With very low mileage and professional maintenance, it offers enthusiasts the ultimate monster truck experience.',
  '/images/vehicles/monster-truck.jpg', '/images/vehicles/monster-truck-tn.jpg', 250000, 560, 'Black/Green', 4
),

-- CUSTOM VEHICLES (classification_id: 1)
(
  6, 'Ford', 'Model T Touring', 1919,
  'A beautifully restored 1919 Ford Model T Touring, showcasing the iconic engineering that shaped early automotive history. Featuring wooden-spoke wheels, an open-top touring body, and authentic period details, this Model T offers collectors and vintage-car enthusiasts a rare opportunity to own a timeless classic.',
  '/images/vehicles/model-t.jpg', '/images/vehicles/model-t-tn.jpg', 24500, 8120, 'Gloss Black', 1
),
(
  16, 'Batmobile', 'Custom', 2021,
  'The 2021 Batmobile Custom offers a unique driving experience with its innovative design and special features. This black custom vehicle includes transforming capabilities and advanced technology systems. With low mileage and careful maintenance, this one-of-a-kind creation provides both performance and novelty for automotive enthusiasts seeking something truly extraordinary.',
  '/images/vehicles/batmobile.jpg', '/images/vehicles/batmobile-tn.jpg', 65000, 2987, 'Black', 1
),
(
  17, 'Aero', 'Car Concept', 2022,
  'The 2022 Aero Car Concept represents cutting-edge automotive design with its revolutionary aerodynamic shape and advanced technology. This silver concept vehicle features innovative materials and engineering solutions that maximize efficiency and performance. With extremely low mileage and pristine condition, it offers a glimpse into the future of automotive transportation.',
  '/images/vehicles/aerocar.jpg', '/images/vehicles/aerocar-tn.jpg', 325000, 890, 'Silver', 1
),
(
  18, 'Mystery', 'Machine', 1978,
  'This iconic 1978 Mystery Machine has been meticulously restored to its original psychedelic glory. The green and blue custom van features unique interior modifications and nostalgic charm. With careful preservation and moderate mileage, this pop culture artifact offers both functional transportation and collector appeal for enthusiasts of automotive history.',
  '/images/vehicles/mystery-van.jpg', '/images/vehicles/mystery-van-tn.jpg', 125000, 45670, 'Green/Blue', 1
),
(
  19, 'Custom', 'Dog Mobile', 2022,
  'The 2022 Custom Dog Mobile is specially designed for pet owners who travel with their furry companions. This multi-color vehicle features secure kennels, feeding stations, and climate control systems to ensure pet comfort and safety. With low mileage and thoughtful design, it provides the perfect solution for pet transportation needs.',
  '/images/vehicles/dog-car.jpg', '/images/vehicles/dog-car-tn.jpg', 45000, 8900, 'Multi-color', 1
)
ON CONFLICT (inv_id) DO NOTHING;

-- FIX: Reset the inventory sequence to continue from the highest ID used
SELECT setval('inventory_inv_id_seq', (SELECT MAX(inv_id) FROM inventory));