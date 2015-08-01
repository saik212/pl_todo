var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

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
var port = app.get('port') || 1337;
app.listen(port, function () {
	console.log('Listening on port elite');
})