// inventory-model.js - EXACT MATCH TO YOUR HTML VEHICLES (IDs 1-19)
console.log("🔄 Using mock data for all vehicles");

const invModel = {
  getClassifications: async () => {
    return {
      rows: [
        { classification_id: 1, classification_name: "Custom" },
        { classification_id: 2, classification_name: "Sport" },
        { classification_id: 3, classification_name: "SUV" },
        { classification_id: 4, classification_name: "Truck" },
        { classification_id: 5, classification_name: "Sedan" }
      ]
    };
  },

  getInventoryByClassificationId: async (classification_id) => {
    console.log(`📊 Mock: Getting vehicles for classification ${classification_id}`);
    
    const mockData = {
      2: [ // Sport - IDs: 1, 2, 6, 7
        { 
          inv_id: 1, 
          inv_make: "Chevy", 
          inv_model: "Camaro", 
          inv_year: 2018, 
          inv_price: 25000,
          inv_image: "/images/vehicles/camaro-tn.jpg",
          inv_thumbnail: "/images/vehicles/camaro-tn.jpg",
          classification_id: 2
        },
        { 
          inv_id: 2, 
          inv_make: "Ford", 
          inv_model: "Mustang", 
          inv_year: 2020, 
          inv_price: 32000,
          inv_image: "/images/vehicles/wrangler-tn.jpg",
          inv_thumbnail: "/images/vehicles/wrangler-tn.jpg",
          classification_id: 2
        },
        { 
  inv_id: 6, 
  inv_make: "Ford", 
  inv_model: "Model T Touring (TN)", 
  inv_year: 1919, 
  inv_price: 24500,
  inv_image: "/images/vehicles/model-t-tn.jpg",
  inv_thumbnail: "/images/vehicles/model-t-tn.jpg",
  classification_id: 1
},

        { 
          inv_id: 7, 
          inv_make: "Lamborghini", 
          inv_model: "Adventador", 
          inv_year: 2023, 
          inv_price: 507000,
          inv_image: "/images/vehicles/aventador-tn.jpg",
          inv_thumbnail: "/images/vehicles/aventador-tn.jpg",
          classification_id: 2
        }
      ],
      3: [ // SUV - IDs: 4, 10, 11
        { 
          inv_id: 4, 
          inv_make: "GM", 
          inv_model: "Hummer", 
          inv_year: 2016, 
          inv_price: 58800,
          inv_image: "/images/vehicles/hummer.jpg",
          inv_thumbnail: "/images/vehicles/hummer.jpg",
          classification_id: 3
        },
        { 
          inv_id: 10, 
          inv_make: "Cadillac", 
          inv_model: "Escalade", 
          inv_year: 2023, 
          inv_price: 89990,
          inv_image: "/images/vehicles/escalade.jpg",
          inv_thumbnail: "/images/vehicles/escalade.jpg",
          classification_id: 3
        },
        { 
          inv_id: 11, 
          inv_make: "Custom", 
          inv_model: "Surf Van", 
          inv_year: 2020, 
          inv_price: 68500,
          inv_image: "/images/vehicles/survan-tn.jpg",
          inv_thumbnail: "/images/vehicles/survan-tn.jpg",
          classification_id: 3
        }
      ],
      5: [ // Sedan - ID: 12
        { 
          inv_id: 12, 
          inv_make: "Ford", 
          inv_model: "Crown Victoria", 
          inv_year: 2013, 
          inv_price: 25000,
          inv_image: "/images/vehicles/crwn-vic-tn.jpg",
          inv_thumbnail: "/images/vehicles/crwn-vic-tn.jpg",
          classification_id: 5
        }
      ],
      4: [ // Truck - IDs: 13, 14, 15
        { 
          inv_id: 13, 
          inv_make: "Emergency", 
          inv_model: "Fire Truck", 
          inv_year: 2021, 
          inv_price: 650000,
          inv_image: "/images/vehicles/fire-truck.jpg",
          inv_thumbnail: "/images/vehicles/fire-truck.jpg",
          classification_id: 4
        },
        { 
          inv_id: 14, 
          inv_make: "Mobile", 
          inv_model: "Mechanic Truck", 
          inv_year: 2022, 
          inv_price: 85000,
          inv_image: "/images/vehicles/mechanic-tn.jpg",
          inv_thumbnail: "/images/vehicles/mechanic-tn.jpg",
          classification_id: 4
        },
        { 
          inv_id: 15, 
          inv_make: "Grave Digger", 
          inv_model: "Monster Truck", 
          inv_year: 2021, 
          inv_price: 250000,
          inv_image: "/images/vehicles/monter-truck.jpg",
          inv_thumbnail: "/images/vehicles/monter-truck.jpg",
          classification_id: 4
        }
      ],
      1: [ // Custom - IDs: 16, 17, 18, 19
        { 
          inv_id: 16, 
          inv_make: "Batmobile", 
          inv_model: "Custom", 
          inv_year: 2021, 
          inv_price: 65000,
          inv_image: "/images/vehicles/batmobile-tn.jpg",
          inv_thumbnail: "/images/vehicles/batmobile-tn.jpg",
          classification_id: 1
        },
        { 
          inv_id: 17, 
          inv_make: "Aero", 
          inv_model: "Car Concept", 
          inv_year: 2022, 
          inv_price: 325000,
          inv_image: "/images/vehicles/aerocartn.jpg",
          inv_thumbnail: "/images/vehicles/aerocartn.jpg",
          classification_id: 1
        },
        { 
          inv_id: 18, 
          inv_make: "Mystery", 
          inv_model: "Machine", 
          inv_year: 1978, 
          inv_price: 125000,
          inv_image: "/images/vehicles/mystery-van.jpg",
          inv_thumbnail: "/images/vehicles/mystery-van.jpg",
          classification_id: 1
        },
        { 
          inv_id: 19, 
          inv_make: "Custom", 
          inv_model: "Dog Mobile", 
          inv_year: 2022, 
          inv_price: 45000,
          inv_image: "/images/vehicles/dog-car-tn.jpg",
          inv_thumbnail: "/images/vehicles/dog-car-tn.jpg",
          classification_id: 1
        }
      ]
    };
    
    return mockData[classification_id] || [];
  },

  getVehicleDetailById: async (inv_id) => {
    console.log(`🔍 Mock: Getting vehicle details for ID ${inv_id}`);
    
    const mockVehicles = {
      // SPORT CARS (1, 2, 6, 7) - classification_id: 2
      1: { 
        inv_id: 1, 
        inv_make: "Chevy", 
        inv_model: "Camaro", 
        inv_year: 2018, 
        inv_price: 25000, 
        classification_name: "Sport",
        classification_id: 2,
        inv_description: "Experience the thrill of driving with this 2018 Chevy Camaro. With its powerful engine and sleek silver exterior, this sport edition delivers exceptional performance at an affordable price. Perfect for those who want to make a statement on the road while enjoying the reliability of a modern sports car with low mileage and premium features.",
        inv_image: "/images/vehicles/camaro-tn.jpg",
        inv_thumbnail: "/images/vehicles/camaro-tn.jpg",
        inv_color: "Silver",
        inv_miles: 10122
      },
      2: { 
        inv_id: 2, 
        inv_make: "Ford", 
        inv_model: "Mustang", 
        inv_year: 2020, 
        inv_price: 32000, 
        classification_name: "Sport",
        classification_id: 2,
        inv_description: "The iconic 2020 Ford Mustang combines classic American muscle with modern technology. This vibrant red sports car features advanced safety systems, premium interior amenities, and a powerful engine that delivers exhilarating performance. With low mileage and meticulous maintenance, this Mustang offers both style and substance for driving enthusiasts seeking an authentic muscle car experience.",
        inv_image: "/images/vehicles/wrangler-tn.jpg",
        inv_thumbnail: "/images/vehicles/wrangler-tn.jpg",
        inv_color: "Red",
        inv_miles: 8500
      },
      6: { 
    inv_id: 6, 
    inv_make: "Ford", 
    inv_model: "Model T Touring (TN)", 
    inv_year: 1919, 
    inv_price: 24500, 
    classification_name: "Custom",
    classification_id: 1,
    inv_description: "A beautifully restored 1919 Ford Model T Touring, showcasing the iconic engineering that shaped early automotive history. Featuring wooden-spoke wheels, an open-top touring body, and authentic period details, this Model T offers collectors and vintage-car enthusiasts a rare opportunity to own a timeless classic.",
    inv_image: "/images/vehicles/model-t-tn.jpg",
    inv_thumbnail: "/images/vehicles/model-t-tn.jpg",
    inv_color: "Gloss Black",
    inv_miles: 8120
},

      7: { 
        inv_id: 7, 
        inv_make: "Lamborghini", 
        inv_model: "Adventador", 
        inv_year: 2023, 
        inv_price: 507000, 
        classification_name: "Sport",
        classification_id: 2,
        inv_description: "Experience automotive excellence with the 2023 Lamborghini Aventador, a masterpiece of Italian engineering. This vibrant orange supercar features a powerful V12 engine, advanced aerodynamics, and cutting-edge technology that delivers unparalleled performance. With extremely low mileage and pristine condition, this Aventador represents the pinnacle of supercar design for discerning collectors.",
        inv_image: "/images/vehicles/aventador-tn.jpg",
        inv_thumbnail: "/images/vehicles/aventador-tn.jpg",
        inv_color: "Orange",
        inv_miles: 1234
      },

      // SUVs (4, 10, 11) - classification_id: 3
      4: { 
        inv_id: 4, 
        inv_make: "GM", 
        inv_model: "Hummer", 
        inv_year: 2016, 
        inv_price: 58800, 
        classification_name: "SUV",
        classification_id: 3,
        inv_description: "The 2016 GM Hummer combines rugged capability with spacious comfort. This distinctive yellow SUV features impressive off-road capabilities while providing ample interior space for passengers and cargo. With its powerful engine and durable construction, this Hummer is perfect for adventurous families or outdoor enthusiasts who demand both performance and practicality.",
        inv_image: "/images/vehicles/hummer-tn.jpg",
        inv_thumbnail: "/images/vehicles/hummer-tn.jpg",
        inv_color: "Yellow",
        inv_miles: 48563
      },
      10: { 
        inv_id: 10, 
        inv_make: "Cadillac", 
        inv_model: "Escalade", 
        inv_year: 2023, 
        inv_price: 89990, 
        classification_name: "SUV",
        classification_id: 3,
        inv_description: "The 2023 Cadillac Escalade redefines luxury SUV standards with its sophisticated black exterior and premium amenities. This vehicle offers an exceptionally comfortable ride with advanced technology features, spacious three-row seating, and superior craftsmanship throughout. With very low mileage and meticulous care, this Escalade provides the ultimate in luxury transportation.",
        inv_image: "/images/vehicles/escalade-tn.jpg",
        inv_thumbnail: "/images/vehicles/escalade-tn.jpg",
        inv_color: "Black",
        inv_miles: 3450
      },
      11: { 
        inv_id: 11, 
        inv_make: "Custom", 
        inv_model: "Surf Van", 
        inv_year: 2020, 
        inv_price: 68500, 
        classification_name: "SUV",
        classification_id: 3,
        inv_description: "This 2020 Custom Surf Van is the perfect companion for beach adventures and road trips. Featuring a comfortable sleeping area, compact kitchenette, and specialized surfboard storage, this blue and white van is designed for outdoor enthusiasts. With moderate mileage and custom modifications, it offers both practicality and style for those who love coastal exploration.",
        inv_image: "/images/vehicles/survan-tn.jpg",
        inv_thumbnail: "/images/vehicles/survan-tn.jpg",
        inv_color: "Blue/White",
        inv_miles: 23450
      },

      // SEDAN (12) - classification_id: 5
      12: { 
        inv_id: 12, 
        inv_make: "Ford", 
        inv_model: "Crown Victoria", 
        inv_year: 2013, 
        inv_price: 25000, 
        classification_name: "Sedan",
        classification_id: 5,
        inv_description: "The 2013 Ford Crown Victoria offers legendary reliability and spacious comfort in a classic sedan package. This white former police vehicle features durable construction, powerful performance, and practical design. With moderate mileage and professional maintenance history, this Crown Victoria provides exceptional value for those seeking a dependable and roomy family sedan.",
        inv_image: "/images/vehicles/crwn-vic-tn.jpg",
        inv_thumbnail: "/images/vehicles/crwn-vic-tn.jpg",
        inv_color: "White",
        inv_miles: 25578
      },

      // TRUCKS (13, 14, 15) - classification_id: 4
      13: { 
        inv_id: 13, 
        inv_make: "Emergency", 
        inv_model: "Fire Truck", 
        inv_year: 2021, 
        inv_price: 650000, 
        classification_name: "Truck",
        classification_id: 4,
        inv_description: "This professional-grade 2021 Emergency Fire Truck is equipped with state-of-the-art firefighting technology and safety features. The bright red vehicle includes a powerful water pump, extensive hose systems, and advanced communication equipment. With low mileage and meticulous maintenance, this fire truck is ideal for municipal departments or industrial facilities requiring reliable emergency response capability.",
        inv_image: "/images/vehicles/fire-truck-tn.jpg",
        inv_thumbnail: "/images/vehicles/fire-truck-tn.jpg",
        inv_color: "Red",
        inv_miles: 8765
      },
      14: { 
        inv_id: 14, 
        inv_make: "Mobile", 
        inv_model: "Mechanic Truck", 
        inv_year: 2022, 
        inv_price: 85000, 
        classification_name: "Truck",
        classification_id: 4,
        inv_description: "The 2022 Mobile Mechanic Truck is a fully-equipped service vehicle designed for professional automotive repair on the go. This white truck features comprehensive tool storage, diagnostic equipment, and workbench space. With moderate mileage and professional maintenance, it's perfect for roadside assistance companies or mobile repair services seeking reliable and efficient operation.",
        inv_image: "/images/vehicles/mechanic-tn.jpg",
        inv_thumbnail: "/images/vehicles/mechanic-tn.jpg",
        inv_color: "White",
        inv_miles: 12340
      },
      15: { 
        inv_id: 15, 
        inv_make: "Grave Digger", 
        inv_model: "Monster Truck", 
        inv_year: 2021, 
        inv_price: 250000, 
        classification_name: "Truck",
        classification_id: 4,
        inv_description: "Experience extreme power with the 2021 Grave Digger Monster Truck, featuring massive 66-inch tires and custom suspension. This black and green beast is equipped with a supercharged engine capable of incredible performance in competition or exhibition events. With very low mileage and professional maintenance, it offers enthusiasts the ultimate monster truck experience.",
        inv_image: "/images/vehicles/monter-truck.jpg",
        inv_thumbnail: "/images/vehicles/monter-truck.jpg",
        inv_color: "Black/Green",
        inv_miles: 560
      },

      // CUSTOM VEHICLES (16, 17, 18, 19) - classification_id: 1
      16: { 
        inv_id: 16, 
        inv_make: "Batmobile", 
        inv_model: "Custom", 
        inv_year: 2021, 
        inv_price: 65000, 
        classification_name: "Custom",
        classification_id: 1,
        inv_description: "The 2021 Batmobile Custom offers a unique driving experience with its innovative design and special features. This black custom vehicle includes transforming capabilities and advanced technology systems. With low mileage and careful maintenance, this one-of-a-kind creation provides both performance and novelty for automotive enthusiasts seeking something truly extraordinary.",
        inv_image: "/images/vehicles/batmobile-tn.jpg",
        inv_thumbnail: "/images/vehicles/batmobile-tn.jpg",
        inv_color: "Black",
        inv_miles: 2987
      },
      17: { 
        inv_id: 17, 
        inv_make: "Aero", 
        inv_model: "Car Concept", 
        inv_year: 2022, 
        inv_price: 325000, 
        classification_name: "Custom",
        classification_id: 1,
        inv_description: "The 2022 Aero Car Concept represents cutting-edge automotive design with its revolutionary aerodynamic shape and advanced technology. This silver concept vehicle features innovative materials and engineering solutions that maximize efficiency and performance. With extremely low mileage and pristine condition, it offers a glimpse into the future of automotive transportation.",
        inv_image: "/images/vehicles/aerocar-tn.jpg",
        inv_thumbnail: "/images/vehicles/aerocar-tn.jpg",
        inv_color: "Silver",
        inv_miles: 890
      },
      18: { 
        inv_id: 18, 
        inv_make: "Mystery", 
        inv_model: "Machine", 
        inv_year: 1978, 
        inv_price: 125000, 
        classification_name: "Custom",
        classification_id: 1,
        inv_description: "This iconic 1978 Mystery Machine has been meticulously restored to its original psychedelic glory. The green and blue custom van features unique interior modifications and nostalgic charm. With careful preservation and moderate mileage, this pop culture artifact offers both functional transportation and collector appeal for enthusiasts of automotive history.",
        inv_image: "/images/vehicles/mystery-van-tn.jpg",
        inv_thumbnail: "/images/vehicles/mystery-van-tn.jpg",
        inv_color: "Green/Blue",
        inv_miles: 45670
      },
      19: { 
        inv_id: 19, 
        inv_make: "Custom", 
        inv_model: "Dog Mobile", 
        inv_year: 2022, 
        inv_price: 45000, 
        classification_name: "Custom",
        classification_id: 1,
        inv_description: "The 2022 Custom Dog Mobile is specially designed for pet owners who travel with their furry companions. This multi-color vehicle features secure kennels, feeding stations, and climate control systems to ensure pet comfort and safety. With low mileage and thoughtful design, it provides the perfect solution for pet transportation needs.",
        inv_image: "/images/vehicles/dog-car-tn.jpg",
        inv_thumbnail: "/images/vehicles/dog-car-tn.jpg",
        inv_color: "Multi-color",
        inv_miles: 8900
      }
    };
    
    return mockVehicles[inv_id] || null;
  }
};

module.exports = invModel;