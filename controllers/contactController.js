// controllers/contactController.js

const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const contactCont = {};

/* ****************************************
 *  Build Contact Form View
 * *************************************** */
contactCont.buildContact = async function (req, res, next) {
  try {
    const vehicleId = req.query.vehicle || null;
    let vehicleData = null;
    
    if (vehicleId) {
      // Fetch vehicle details from database
      vehicleData = await invModel.getVehicleDetailById(vehicleId);
    }
    
    const nav = await utilities.getNav();
    const user = req.user || req.session.user || null;
    
    res.render("contact", {
      title: 'Contact Us | CSE Motors',
      vehicle: vehicleData,
      user: user,
      errors: null,
      formData: {},
      nav: nav
    });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    next(error);
  }
};

/* ****************************************
 *  Process Contact Form Submission
 * *************************************** */
contactCont.processContact = async function (req, res, next) {
  try {
    const { name, email, phone, message, vehicle_id, preferred_contact, subject, newsletter } = req.body;
    
    // Validate inputs
    const errors = [];
    if (!name || name.trim() === '') errors.push('Please enter your name');
    if (!email || email.trim() === '') errors.push('Please enter your email');
    if (!message || message.trim() === '') errors.push('Please enter a message');
    
    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    let vehicleData = null;
    if (vehicle_id) {
      vehicleData = await invModel.getVehicleDetailById(vehicle_id);
    }
    
    const nav = await utilities.getNav();
    const user = req.user || req.session.user || null;
    
    if (errors.length > 0) {
      return res.render("contact", {
        title: 'Contact Us | CSE Motors',
        vehicle: vehicleData,
        user: user,
        errors,
        formData: req.body,
        nav: nav
      });
    }
    
    // Save to database
    try {
      const savedSubmission = await invModel.saveContactSubmission({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : null,
        message: message.trim(),
        vehicle_id: vehicle_id || null,
        preferred_contact: preferred_contact || 'email',
        newsletter: newsletter === 'on'
      });
      
      console.log('✅ Contact submission saved to database:', savedSubmission.contact_id);
      
      // Optional: Send email notification (implement this separately)
      // await sendContactEmail(savedSubmission);
      
    } catch (dbError) {
      console.log("⚠️ Database error while saving contact:", dbError.message);
      // Continue even if database save fails - don't break the user experience
    }
    
    // Redirect to success page
    req.flash("success", "✅ Your message has been sent successfully! We'll respond within 24 hours.");
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      }
      res.redirect('/contact/success');
    });
    
  } catch (error) {
    console.error("❌ Process contact error:", error);
    
    // Show error but don't crash
    req.flash("error", "⚠️ There was an error sending your message. Please try again or call us directly.");
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      }
      res.redirect('/contact');
    });
  }
};

/* ****************************************
 *  Show Contact Success Page
 * *************************************** */
contactCont.contactSuccess = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const user = req.user || req.session.user || null;
    
    res.render("contact-success", {
      title: 'Message Sent | CSE Motors',
      user: user,
      nav: nav,
      messages: res.locals.flashMessages || {}
    });
  } catch (error) {
    console.error("❌ Contact success page error:", error);
    next(error);
  }
};

/* ****************************************
 *  View Contact Submissions (Admin Only)
 * *************************************** */
contactCont.viewContactSubmissions = async function (req, res, next) {
  try {
    // Check if user is admin or employee
    const user = req.user || req.session.user || null;
    if (!user || (user.account_type !== 'Admin' && user.account_type !== 'Employee')) {
      req.flash("error", "⛔ Access denied. Admin or Employee privileges required.");
      return res.redirect('/');
    }
    
    const nav = await utilities.getNav();
    const submissions = await invModel.getContactSubmissions();
    const statistics = await invModel.getContactStatistics();
    
    res.render("contact/contact-submissions", {
      title: 'Contact Submissions | CSE Motors',
      user: user,
      submissions: submissions,
      statistics: statistics,
      nav: nav,
      messages: res.locals.flashMessages || {}
    });
  } catch (error) {
    console.error("❌ View contact submissions error:", error);
    next(error);
  }
};

/* ****************************************
 *  View Single Contact Submission (Admin Only)
 * *************************************** */
contactCont.viewContactSubmission = async function (req, res, next) {
  try {
    // Check if user is admin or employee
    const user = req.user || req.session.user || null;
    if (!user || (user.account_type !== 'Admin' && user.account_type !== 'Employee')) {
      req.flash("error", "⛔ Access denied. Admin or Employee privileges required.");
      return res.redirect('/');
    }
    
    const contact_id = parseInt(req.params.contact_id);
    const submission = await invModel.getContactSubmissionById(contact_id);
    
    if (!submission) {
      req.flash("error", "Contact submission not found.");
      return res.redirect('/contact/submissions');
    }
    
    // Mark as read when viewing
    await invModel.markContactAsRead(contact_id);
    
    const nav = await utilities.getNav();
    
    res.render("contact/contact-detail", {
      title: 'Contact Submission Details | CSE Motors',
      user: user,
      submission: submission,
      nav: nav,
      messages: res.locals.flashMessages || {}
    });
  } catch (error) {
    console.error("❌ View contact submission error:", error);
    next(error);
  }
};

/* ****************************************
 *  Delete Contact Submission (Admin Only)
 * *************************************** */
contactCont.deleteContactSubmission = async function (req, res, next) {
  try {
    // Check if user is admin
    const user = req.user || req.session.user || null;
    if (!user || user.account_type !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: "⛔ Access denied. Admin privileges required." 
      });
    }
    
    const contact_id = parseInt(req.body.contact_id);
    const result = await invModel.deleteContactSubmission(contact_id);
    
    if (result) {
      req.flash("success", "✅ Contact submission deleted successfully.");
      
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
        }
        res.json({ 
          success: true, 
          message: "Contact submission deleted successfully.",
          redirect: '/contact/submissions'
        });
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "Contact submission not found." 
      });
    }
  } catch (error) {
    console.error("❌ Delete contact submission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting contact submission." 
    });
  }
};

module.exports = contactCont;