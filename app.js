var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

// middleware
app.use(bodyParser());
app.use(express.static(path.join(__dirname + 'bower_components')));

// set view engine and path; interpret ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// exports
app.use(require('./router'));

// initialize app

app.listen(1337, function () {
	console.log('Listening on port elite');
})