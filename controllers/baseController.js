const baseController = {};

baseController.buildHome = async function(req, res) {
  // Add flash message before rendering
  req.flash("notice", "Welcome to CSE Motors!");
  
  res.render("index", {
    title: "Home | CSE Motors"
  });
};

module.exports = baseController;