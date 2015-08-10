// This view takes care of CRUD operations on the front-end and communicates with the server for data.
// The view is re-rendered when changes are made to the collection. If a single model is updated, the collection is
// re-fetched, and the view is re-rendered. This can be done in a better manner by having subviews or composite views,
// allowing for only certain parts of the page re-rendered when necessary


Bucket.Views.Main = Backbone.View.extend({
	initialize: function (options) {
		if (Parse.User.current()) {
			this.currentUser = Parse.User.current().attributes.username;
		}
		this.listenTo(Bucket.todos, 'sync add remove', this.render);
	},

	events: {
		"click .add-btn": "addTodo",
		"click .dlt": "deleteTodo",
		"click .updt": "updateTodo",
		"click #sign-in": "signIn",
		"click #sign-up": "signUp",
		"click .logout": "logOut"
	},

	render: function () {
		$(this.el).empty();
		if (Parse.User.current()) {
			this.renderContent();
		} else {
			console.log('no current user');
			this.renderSignIn();
		}
	},

	renderSignIn: function () {
		var formTemplate = "<form class='form-signin'>"+
        "<label for='inputUsername' class='sr-only'>Username</label>"+
        "<input id='inputUsername' class='form-control' placeholder='Username'>"+
        "<label for='inputPassword' class='sr-only'>Password</label>"+
        "<input type='password' id='inputPassword' class='form-control' placeholder='Password'>"+
        "<button class='btn btn-lg btn-primary btn-block' id='sign-in' type='submit'>Sign in</button>"+
        "<h1 class='form-signin-heading'>Or</h1>"+
        "<label for='inputPassword' class='sr-only'>Password</label>"+
        "<input type='password' id='reInputPassword' class='form-control' placeholder='Re-Enter Password'>"+
        "<button class='btn btn-lg btn-primary btn-block' id='sign-up' type='submit'>Sign Up</button>"+
	      "</form>";


    $(this.el).html(formTemplate);
	},

	renderContent: function () {
		var contentTemplate = "<div class='list-container group'><button type='button' class="+
			"'logout btn btn-danger btn-lg'>Logout</button><h1>"+this.currentUser+"'s List:</h1><div class='add-todo-wrapper'>"+
			"</div><ul class='todos'></ul></div>";

		$(this.el).html(contentTemplate);
		this.renderTodoForm();
		this.renderTodos();

	},

	renderTodoForm: function () {
		var form = $('.add-todo-wrapper');

		var formTemplate = "<h1 class='new-header'>New item:</h1>"+
											 "<div class='add-todo group'>"+
											 "<textarea class='new-todo'></textarea>"+
											 "<button type='button' class='btn btn-success btn-lg add-btn'>Add Item</button>"+
											 "</div>";

		form.append(formTemplate);

	},



// When rendering the to-dos, I created a template for the list-items to be added to the list of to-dos.
// It would be cleaner to have the HTML inside a template file. It is here out of convenience.
// This function also applies the appropriate classes and attributes to a to-do based on completion status.
	renderTodos: function () {
		var list = $('.todos');
		Bucket.todos.forEach(function (todo) {
			var statusClass, statusText;

			if (todo.get('complete') === false) {
				statusClass = 'stat-inc';
				statusText = 'Complete';
			} else {
				statusClass = 'stat-comp';
				statusText = 'Incomplete';
			}

			var todoTemplate = "<li class='todo group'><span class='todo-desc'>- "+todo.get('desc')+
						"</span><span class='todo-status todo"+todo.id+"'><i data-id="+todo.id+" class='updt "+
						statusClass+" fa fa-check-square-o'>  Mark as "+statusText+"</i><i data-id="+todo.id+" class='dlt fa fa-trash'>Delete</i></span></li>";
			list.append(todoTemplate);
		});


	},

// Adding a to-do: trigger event, grab text from input field, set description as attribute for new model, save model
	addTodo: function (event) {
		event.preventDefault();
		var that = this;

		var text = $('.new-todo').val();
		var todo = new Bucket.Models.Todo({desc: text, createdBy: this.currentUser});
		todo.save({}, {
			success: function (req, res) {
				todo.set({id: res.objectId});
				Bucket.todos.add(todo);
				that.removeSpinner('.add-todo');
			},
			error: function (req, res) {
				that.showError('.add-todo', res.message);
				that.removeSpinner('.add-todo');
			}
		});

		this.addSpinner('.add-todo', 'Adding todo...');
	},


// Deleting a to-do: trigger event, grab id from event.target, find model by id, destroy model and remove it from the collection
	deleteTodo: function (event) {
		event.preventDefault();
		var that = this;
		
		var todoId = $(event.target).data('id');

		var todo = new Bucket.Models.Todo({id: todoId});
		todo.fetch({
			success: function () {
				todo.destroy({
					success: function (req, res) {
						Bucket.todos.remove(todo);
						that.removeSpinner('.todo'+todoId);
					},
					error: function (req, res) {
						that.removeSpinner('.todo'+todoId);
						that.showError('.todo'+todoId, res.message);
					}
				});
				that.addSpinner('.todo'+todoId, 'Deleting...');
			}
		});

	},


// Updating a to-do: trigger event, grab todo id, set new attribute and update model
// Before to-do is updated, completion status is checked. If to-do is already
// complete, no request is sent to server, and user is notified.
// Allowing the user to try to change status to incomplete is here to show the 
// update functionality works properly. If I did not want the user to update
// a to-do's status, I would hide the functionality completely.
	updateTodo: function (event) {
		event.preventDefault();
		var that = this;
		
		var todoId = $(event.target).data('id');

		var todo = new Bucket.Models.Todo({id: todoId});
		todo.fetch({
			success: function () {
				if (todo.get('complete') === false) {
					todo.set({complete: true});
					todo.save({}, {
						success: function (todo) {
							Bucket.todos.fetch({data: {user: that.currentUser}});
							that.removeSpinner('.todo'+todoId);
						},
						error: function (todo, error) {
							that.removeSpinner('.todo'+todoId);
							that.showError('.todo'+todoId, error.message);
						}
					});
					that.addSpinner('.todo'+todoId, 'Updating...')
				} else {
					// if status is already complete, user is notified that they cannot do this
					that.showError('.todo'+todoId, "Can't reinstate an item");
				}
			}
		});
	},

// User sign-in
	signIn: function (event) {
		event.preventDefault();
		var that = this;

		var username = $('#inputUsername').val();
		var password = $('#inputPassword').val();

		Parse.User.logIn(username, password, {
			success: function () {
				that.currentUser = Parse.User.current().attributes.username;
				that.removeSpinner('#sign-in');
				Bucket.todos.fetch({data: {user: that.currentUser}});

			},
			error: function (req, res) {
				that.showError('#sign-in', res.message, 'login');
				that.removeSpinner('#sign-in');
			}
		});

		this.addSpinner('#sign-in', 'Loading account...');
	},	

// User sign-up
	signUp: function (event) {
		event.preventDefault();
		var that = this;

		var username = $('#inputUsername').val();
		var password = $('#inputPassword').val();
		var passCheck = $('#reInputPassword').val();

		if (password === passCheck) {
			var user = new Parse.User();
			user.set('username', username);
			user.set('password', password);
			user.signUp(null, {
				success: function (user) {
					that.currentUser = Parse.User.current().attributes.username;
					Bucket.todos.fetch({data: {user: that.currentUser}});
					that.removeSpinner('#sign-up');
					// that.render();
				},
				error: function (user, error) {
					that.showError('#sign-up', error.message, 'login');
					that.removeSpinner('#sign-up');
				}
			});
			this.addSpinner('#sign-up', 'Creating account...');

		} else {
			this.showError('#sign-up', "Passwords don't match", 'login');
		}
	},

// User sign-out
	logOut: function (event) {
		event.preventDefault();
		var that = this;

		Parse.User.logOut();
		this.render();
	},

// Utility Functions
	showError: function (selector, message, type) {
		var element = "<h1 class='error' style='color:red;margin:5px 0'>"+message+"</h1>";
		if (type === 'login') {
			$(selector).before(element);
		} else {
			$(selector).append(element);
		}

		window.setTimeout(function () {
			$('.error').remove();
		}, 2000);
	},

	addSpinner: function (container, message) {
		$(container).append("<div class='loading-notice'>"+message+"</div>");
		$(container).append("<i class='fa fa-cog fa-spin'></i>");
	},

	removeSpinner: function (container) {
		$('.fa-spin').remove();
		$('.loading-notice').remove();
	}


});

