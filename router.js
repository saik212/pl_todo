// Setting up the routing for the application. Requests for data go through routes namespaced with /api/
// For a simple to-do list, only CRUD routes are used
// Update route allows for updating a to-do description and completion status.
// Description edit functionality not built on front-end


var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;
var Todo = Parse.Object.extend('Todo');



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


// Parsing Todo List from Parse query
var parseTodos = function (results) {
	var parsedResults = [];
	for (var i=0; i<results.length; i++) {
		results[i].attributes.id = results[i].id;
		parsedResults.push(results[i].attributes);
	}

	return parsedResults;
}

// set up routes


router.get('/', function (req, res) {
	res.render('index');
});


// Basic CRUD for todos

router.route('/api/todos')
	// Sending up collection of to-dos
	.get(function (req, res) {
		if (req.query.user) {

		var query = new Parse.Query(Todo);
		query.equalTo('createdBy', req.query.user);
		query.find({
			success: function (results) {
				// res.json(results);
				res.json(parseTodos(results));
				console.log(75);
				console.log(parseTodos(results));
				// console.log(todoList);
			},
			error: function (error) {
				console.log(error);
			}
		});


			
		} else {
			res.json([]);
		}
				// res.json(todoList);
		// console.log(req.query.user);
	})

	// Creating a new to-do
	.post(function (req, res) {
		// totalItems+=1;
		// var newItem = {id: totalItems, desc: req.body.desc, complete: false};
		// todoList.push(newItem);
		// res.json(newItem);
		var todo = new Todo();
		todo.set('createdBy', req.body.createdBy);
		todo.set('desc', req.body.desc);
		todo.set('complete', false);
		todo.save(null, {
			success: function () {
				res.json(todo);
			},
			error: function (error) {
				res.json(error);
			}
		});
	});



router.route('/api/todos/:id')
	// Sending up a single to-do
	.get(function (req, res) {
		var query = new Parse.Query(Todo);
		query.equalTo('objectId', req.params.id);
		query.find({
			success: function (results) {
				console.log(121);
				console.log(results);
				res.json(results[0]);
			},
			error: function (results, error) {
				console.log(126);
				console.log(error);
			}
		});
		// res.json('hello. the id was: ' + req.params.id);
		// var reqId = parseInt(req.params.id);
			
		// res.json(todoList[searchList(reqId)]);
	})

	// Updating a single to-do
	.put(function (req, res) {
		var query = new Parse.Query(Todo);
		query.equalTo('objectId', req.params.id);
		query.first({
			success: function (object) {
				object.set('complete', true);
				object.save(null, {
					success: function () {
						res.json(object);
					},
					error: function () {
						res.json('could not update');
					}
				})
				// var todo = results[0];
				// res.json(parseTodos(results[0]));
				// console.log(results);
				// res.json(parseTodos(results)[0]);
			},
			error: function (results, error) {
				console.log(147);
				console.log(error);
			}
		});
		// var reqId = parseInt(req.params.id);
		// var item = todoList[searchList(reqId)];
		// item.desc = req.body.desc;
		// item.complete = req.body.complete;
		// res.json(item);
	})

	// Deleting a single to-do
	.delete(function (req, res){
		var query = new Parse.Query(Todo);
		query.equalTo('objectId', req.params.id);
		query.first({
			success: function (object) {
				object.destroy({
					success: function () {
						res.json(object);
					},
					error: function () {
						res.json('could not destroy');
					}
				})
			},
			error: function (results, error) {
				console.log(147);
				console.log(error);
			}
		});
	});




// export router
module.exports = router;