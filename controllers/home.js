exports.getHomePage = function(req, res) {
  
  if (req.user) {
    res.render('./home.html');
  }
  else
  	res.render('./login.html')
};