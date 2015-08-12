// Setting up the routing for the application. Requests for data go through routes namespaced with /api/
// For a simple to-do list, only CRUD routes are used
// Update route allows for updating a to-do description and completion status.


var express = require('express');
var router = express.Router();
var Parse = require('parse').Parse;
var Todo = Parse.Object.extend('Todo');
Parse.User.enableUnsafeCurrentUser();




// Parsing Todo List from Parse query
// This is done so that collection will have models with Id's rather than
// objectId's. This is to help with routing for individual models on the front-end.
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


// Setting Users
	router.route('/api/users')

		.post(function (req, res) {
			var user = new Parse.User();
			var username = req.body.username;
			var pass = req.body.pass;
			var passCheck = req.body.passCheck;

			if (pass != passCheck) {
				res.status(400);
				res.json('Passwords do not match');
				return;
			}

			user.set('username', username);
			user.set('password', pass);

			user.signUp(null, {
				success: function (user) {
					res.status(200);
					res.json(user);
				},
				error: function (user, error) {
					res.status(400);
					res.json(error.message);
					console.log(error);
				}
			});

		});

	router.route('/api/session')
		.get(function (req, res) {
			// res.status(200);
			if (Parse.User.current()) {
				res.status(200);
				res.json(Parse.User.current().attributes);
			} else {
				res.status(200);
				res.json(null);
			}
		})

		.post(function (req, res) {
			Parse.User.logIn(req.body.username, req.body.pass, {
				success: function (user) {
					res.status(200);
					res.json(user);
				},
				error: function (user, error) {
					res.status(400);
					res.json(error.message);
				}
			});
		})

		.delete(function (req, res) {
			Parse.User.logOut();
			if (Parse.User.current()) {
				res.status(500);
				res.json('Could not logout');
			} else {
				res.status(200);
				res.json('Successfully logged out');
			}
		});



// Basic CRUD for todos

router.route('/api/todos')
	// Sending up collection of to-dos
	.get(function (req, res) {
		if (Parse.User.current()) {
			var query = new Parse.Query(Todo);
			query.equalTo('createdBy', Parse.User.current().attributes.username);
			query.find({
				success: function (results) {
					res.status(200);
					res.json(parseTodos(results));
				},
				error: function (error) {
					res.status(404)
					res.json(error.message);
					console.log(error);
				}
			});
		} else {
			res.status(200);
			res.json('No user present');
		}
	})

	// Creating a new to-do
	.post(function (req, res) {
		var todo = new Todo();
		todo.set('createdBy', req.body.createdBy);
		todo.set('desc', req.body.desc);
		todo.set('complete', false);
		todo.save(null, {
			success: function () {
				res.status(200);
				res.json(todo);
			},
			error: function (error) {
				res.status(400);
				res.json(error.message);
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
				res.status(200);
				res.json(results[0]);
			},
			error: function (results, error) {
				res.status(404);
				res.json(error.message);
			}
		});
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
						res.status(200);
						res.json(object);
					},
					error: function (error) {
						res.status(400);
						res.json(error.message);
					}
				})
			},
			error: function (results, error) {
				res.status(404);
				res.json(error.message);
				console.log(error);
			}
		});
	})

	// Deleting a single to-do
	.delete(function (req, res){
		var query = new Parse.Query(Todo);
		query.equalTo('objectId', req.params.id);
		query.first({
			success: function (object) {
				object.destroy({
					success: function () {
						res.status(200);
						res.json(object);
					},
					error: function (error) {
						res.status(400);
						res.json(error.message);
						res.json('could not destroy');
					}
				})
			},
			error: function (results, error) {
				res.status(404);
				res.json(error.message);
				console.log(error);
			}
		});
	});




// export router
module.exports = router;