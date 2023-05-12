// Handle GET request to display a 404 error page
exports.get404 = (req, res, next) => {
  // Set the response status code to 404 and render the "404" page using a template engine
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
};

// Handle GET request to display a 500 error page
exports.get500 = (req, res, next) => {
  // Set the response status code to 500 and render the "500" page using a template engine
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
};