const { body, validationResult } = require('express-validator');
const utilities = require('./index'); // ← ADD THIS IMPORT

// Validation rules for classification
const classificationValidationRules = () => {
    return [
        body('classification_name')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Classification name is required')
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage('Classification name cannot contain spaces or special characters')
    ];
}

// Check validation result
const checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav(); // ← NOW THIS WILL WORK
        req.flash('message', 'Please correct the errors below.');
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: errors.array().map(error => error.msg),
            message: { type: 'error', message: 'Please correct the errors below.' }
        });
        return;
    }
    next();
}

module.exports = { classificationValidationRules, checkClassificationData };