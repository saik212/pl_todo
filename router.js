// Setting up the routing for the application. Requests for data go through routes namespaced with /api/
// For a simple to-do list, only CRUD routes are used
// Update route allows for updating a to-do description and completion status.
// Description edit functionality not built on front-end


var express = require('express');
var router = express.Router();


// Pseudo DB setup
// In the interest of time, an array of objects is used as the the data to be used
var todoList = [
		{id:1, desc: 'Go skydiving', complete: false},
		{id:2, desc: 'Watch The Matrix', complete: false},
		{id:3, desc: 'Watch A Nightmare Before Christmas', complete: false},
		{id:4, desc: 'Make a todo list', complete: false},
		{id:5, desc: 'Watch Raising Arizona', complete: false}
];

// var to keep track of ID for added items (needed for lack of DB)
var totalItems = 5;

// search helper method
// get params ID, and search for element
// o(n) used for convenience, but is not optimal
var searchList = function (id) {
	var todoItemIdx = "Item not found";
	for (var i=0; i<todoList.length; i++) {
		if (todoList[i].id === id) {
			todoItemIdx = i;
			break
		}
	};

	return todoItemIdx;
}

// set up routes


router.get('/', function (req, res) {
	res.render('index');
});


// Basic CRUD for todos

router.route('/api/todos')
	// Sending up collection of to-dos
	.get(function (req, res) {
		res.json(todoList);
	})

	// Creating a new to-do
	.post(function (req, res) {
		totalItems+=1;
		var newItem = {id: totalItems, desc: req.body.desc, complete: false};
		todoList.push(newItem);
		res.json(newItem);
	});

router.route('/api/todos/:id')
	// Sending up a single to-do
	.get(function (req, res) {
		var reqId = parseInt(req.params.id);
			
		res.json(todoList[searchList(reqId)]);
	})

	// Updating a single to-do
	.put(function (req, res) {
		var reqId = parseInt(req.params.id);
		var item = todoList[searchList(reqId)];
		item.desc = req.body.desc;
		item.complete = req.body.complete;
		res.json(item);
	})

	// Deleting a single to-do
	.delete(function (req, res){
		var reqId = parseInt(req.params.id);
		var delIdx = searchList(reqId);
		var delItem = todoList[delIdx];

		todoList.splice(delIdx, 1);

		res.json(delItem);
	});




// export router
module.exports = router;