var express = require('express');
var router = express.Router();


// Pseudo DB setup
var todoLists = [{
	id: 1,
	title: 'Movies to watch',
	items: [
		{title: 'Gone with the Wind', watched: false},
		{title: 'The Matrix', watched: false},
		{title: 'A Nightmare Before Christmas', watched: false},
		{title: 'The Room', watched: false},
		{title: 'Raising Arizona', watched: false}
	]
}];

// set up routes
router.get('/', function (req, res) {
	res.render('index');
});

router.route('/api/todos')
	.get(function (req, res) {
		res.json(todoLists);
	})

	.post(function (req, res) {
		res.json('So you wanna make a new list, eh?');
	});

// router.get('/api/todos', function (req, res) {
// 	res.json(todoLists);
// });

// router.post('/api/todos', function (req, res) {
// 	res.json('So you wanna make a new list, eh?');
// })




// export router
module.exports = router;