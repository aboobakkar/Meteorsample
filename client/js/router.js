console.log("router.js");

Router.route('/', function () {
  this.render('dashboard');
  this.layout('generalLayout');
  document.title = "COM DEVICES | Dashboard";
});

Router.route('/dashboard', function () {
  this.render('dashboard');
  this.layout('generalLayout');
  document.title = "COM DEVICES | Dashboard";
});




Router.route('/forms/general', function () {
  this.render('generalFormPage');
  this.layout('generalLayout');
  document.title = "AdminLTE | General Forms";
});

/* Have to be last to catch all no defined URL */
Router.route('/(.*)', function () {
  this.render('404');
  this.layout('generalLayout');
  document.title = "COM DEVICES | Page not found";
});