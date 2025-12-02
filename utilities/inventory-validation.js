const { body, validationResult } = require('express-validator');
const utilities = require('./index');

// Validation rules for inventory
const inventoryValidationRules = () => {
    return [
        body('classification_id')
            .isInt({ min: 1 })
            .withMessage('Please select a valid classification'),
        body('inv_make')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Make is required'),
        body('inv_model')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Model is required'),
        body('inv_description')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Description is required'),
        body('inv_price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('inv_year')
            .isInt({ min: 1900, max: 2030 })
            .withMessage('Year must be between 1900 and 2030'),
        body('inv_miles')
            .isInt({ min: 0 })
            .withMessage('Miles must be a positive number'),
        body('inv_color')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Color is required')
    ];
}

// Check validation result for adding inventory
const checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const classificationList = await utilities.buildClassificationList(req.body.classification_id);
        
        req.flash('message', 'Please correct the errors below.');
        res.render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            classificationList,
            errors: errors.array().map(error => error.msg),
            message: { type: 'error', message: 'Please correct the errors below.' },
            // Sticky form data
            ...req.body
        });
        return;
    }
    next();
}

/* *****************************
 * Check Update Data
 * ***************************** */
const checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);
        
        const itemName = `${req.body.inv_make} ${req.body.inv_model}`;
        
        res.render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: errors.array().map(error => error.msg),
            inv_id: req.body.inv_id,
            inv_make: req.body.inv_make,
            inv_model: req.body.inv_model,
            inv_year: req.body.inv_year,
            inv_description: req.body.inv_description,
            inv_image: req.body.inv_image,
            inv_thumbnail: req.body.inv_thumbnail,
            inv_price: req.body.inv_price,
            inv_miles: req.body.inv_miles,
            inv_color: req.body.inv_color,
            classification_id: req.body.classification_id
        });
        return;
    }
    next();
}

module.exports = { 
    inventoryValidationRules, 
    checkInventoryData,
    checkUpdateData 
};