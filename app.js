// These are modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var Parse = require('parse').Parse;
Parse.User.enableUnsafeCurrentUser();

// If I had more time I would use Figaro module to hide my keys, and then run it on a Deployment service (Heroku, AWS, Docker, Digital Ocean)
Parse.initialize('U6by9eTVp9ZiAgsGruUpnhL8RIJXxc4ka9Y3niP9',
	'rHVii2SEnus7m0dHHthdRSxbsnzG0nOkkGVgjuTu');



// middleware
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'node_modules/backbone')));
app.use(express.static(path.join(__dirname, 'views')));

// set view engine and path; interpret ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// exports
app.use(require('./router'));

// initialize app
var port = process.env.PORT || 1337;

app.listen(port, function () {
	console.log('Listening on port elite');
})