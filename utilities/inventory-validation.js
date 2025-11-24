const { body, validationResult } = require('express-validator');
const utilities = require('./index'); // ← ADD THIS IMPORT

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

// Check validation result
const checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav(); // ← NOW THIS WILL WORK
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

module.exports = { inventoryValidationRules, checkInventoryData };