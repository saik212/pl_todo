// This view takes care of CRUD operations on the front-end and communicates with the server for data.
// The view is re-rendered when changes are made to the collection. If a single model is updated, the collection is
// re-fetched, and the view is re-rendered. This can be done in a better manner by having subviews or composite views,
// allowing for only certain parts of the page re-rendered when necessary


Bucket.Views.List = Backbone.View.extend({
	initialize: function (options) {
		this.list = $('.todos');
		this.form = $('.add-todo-wrapper');
		this.listenTo(Bucket.todos, 'sync add remove', this.render);
		// this.listenTo(Parse.User.current(), 'change', this.stuff);
		// this.render();
	},

	events: {
		"click .add-btn": "addTodo",
		"click .dlt": "deleteTodo",
		"click .updt": "updateTodo",
		"click #sign-in": "signIn",
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
        "<h2 class='form-signin-heading'>Please sign in</h2>"+
        "<label for='inputUsername' class='sr-only'>Username</label>"+
        "<input id='inputUsername' class='form-control' placeholder='Username'>"+
        "<label for='inputPassword' class='sr-only'>Password</label>"+
        "<input type='password' id='inputPassword' class='form-control' placeholder='Password'>"+
        "<button class='btn btn-lg btn-primary btn-block' id='sign-in' type='submit'>Sign in</button>"+
	      "</form>";


    $(this.el).html(formTemplate);
	},

	renderContent: function () {
		var contentTemplate = "<div class='list-container group'><div class='logout'>Logout</div><div class='add-todo-wrapper'>"+
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
					"<div class='add-btn'>Add Item</div>"+
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

		var text = $('.new-todo').val();
		var todo = new Bucket.Models.Todo({desc: text, createdBy: Parse.User.current().attributes.username});
		todo.save({}, {
			success: function () {
				Bucket.todos.add(todo);
			},
			error: function (req, res) {
				console.log('Errored out');
				console.log(res);
			}
		})
	},


// Deleting a to-do: trigger event, grab id from event.target, find model by id, destroy model and remove it from the collection
	deleteTodo: function (event) {
		event.preventDefault();
		
		var todoId = $(event.target).data('id');

		var todo = new Bucket.Models.Todo({id: todoId});
		todo.fetch({
			success: function () {
				todo.destroy();
				Bucket.todos.remove(todo);
			}
		});

		console.log('delete todo #'+todoId);
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
		console.log('update todo #:'+todoId);

		var todo = new Bucket.Models.Todo({id: todoId});
		todo.fetch({
			success: function () {
				if (todo.get('complete') === false) {
					todo.set({complete: true});
					todo.save({}, {
						success: function () {
							console.log('hey from updating');
							Bucket.todos.fetch({data: {user: Parse.User.current().attributes.username}});
						}
					});
				} else {
					// if status is already complete, user is notified that they cannot do this
					$('.todo'+todoId).append("<h1 class='error' style='color:red'>cannot reinstate an item</h1>");
					window.setTimeout(function () {
						$('.error').remove();
					}, 2000);
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
				console.log('Successfully Logged In');
				Bucket.todos.fetch({data: {user: Parse.User.current().attributes.username}});

				that.render();
			},
			error: function (error) {
				console.log('Login Failed');
			}
		});
	},	

	logOut: function (event) {
		event.preventDefault();
		var that = this;

		Parse.User.logOut();
		this.render();
	}
});