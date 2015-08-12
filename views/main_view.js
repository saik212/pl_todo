// This view takes care of CRUD operations on the front-end and communicates with the server for data.
// The view is re-rendered when changes are made to the collection. If a single model is updated, the collection is
// re-fetched, and the view is re-rendered. This can be done in a better manner by having subviews or composite views,
// allowing for only certain parts of the page re-rendered when necessary


Bucket.Views.Main = Backbone.View.extend({
	initialize: function (options) {
		this.currentUser = options.currentUser || null;
		if (!this.currentUser) {
			this.render();
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
		if (this.currentUser) {
			this.renderContent();
		} else {
			console.log('no current user');
			this.renderSignIn();
		}
	},

	renderSignIn: function () {
		// Due to time constraints, I saved the html as a string and put it in the main container.
		// It should be noticed that under normal circumstances, this would never be done. Without
		// html escaping, there is a risk of XSS script injections.
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
			"'logout btn btn-danger btn-lg'>Logout</button><h1>"+this.currentUser.username+"'s List:</h1><div class='add-todo-wrapper'>"+
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
// It would be cleaner and safer to use a templating engine like EJS to account for DRY code as well as
// HTML escaping. Having the HTML here is purely for convenience in this demonstration.
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
		var todo = new Bucket.Models.Todo({desc: text, createdBy: this.currentUser.username});
		todo.save({}, {
			success: function (req, res) {
				todo.set({id: res.objectId});
				Bucket.todos.add(todo);
			},
			error: function (req, res) {
				that.showError('.add-todo', res.message);
				// that.removeSpinner();
				// $('.fa-spin').remove();
				that.render();
			}
		});

		this.addSpinner('.add-todo');
	},


// Deleting a to-do: trigger event, grab id from event.target, find model by id, destroy model and remove it from the collection
	deleteTodo: function (event) {
		event.preventDefault();
		var that = this;
		
		var todoId = $(event.target).data('id');
		that.addSpinner('.todo'+todoId);

		var todo = new Bucket.Models.Todo({id: todoId});
		todo.fetch({
			success: function () {
				todo.destroy({
					success: function (req, res) {
						Bucket.todos.remove(todo);
					},
					error: function (req, res) {
						that.showError('.todo'+todoId, res.message);
					}
				});
			}
		});

	},


// Updating a to-do: trigger event, grab todo id, set new attribute and update model
// Before to-do is updated, completion status is checked. If to-do is already
// complete, no request is sent to server, and user is notified.
// Allowing the user to try to change status to incomplete is here to show the 
// update functionality works properly. If I did not want the user to update
// a to-do's status, I would hide the functionality completely.
// As an aside, the validation of updated todos is best done server-side. It is done here due to time constraints

	updateTodo: function (event) {
		event.preventDefault();
		var that = this;
		
		var todoId = $(event.target).data('id');

		var todo = new Bucket.Models.Todo({id: todoId});
		that.addSpinner('.todo'+todoId);
		todo.fetch({
			success: function () {
				if (todo.get('complete') === false) {
					todo.set({complete: true});
					todo.save({}, {
						success: function (todo) {
							Bucket.todos.fetch({
								success: function () {
									that.removeSpinner();
								}
							});
						},
						error: function (todo, error) {
							that.removeSpinner();
							that.showError('.todo'+todoId, error.message);
						}
					});
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

		var user = new Bucket.Models.CurrentUser({username: username, pass: password});
		user.save({}, {
			success: function (res, req) {
				that.currentUser = res.attributes;
				Bucket.todos.fetch({
					success: function () {
						that.removeSpinner();
					}
				});
			},
			error: function (res, req) {
				that.showError('#sign-in', 'Invalid Credentials', 'login');
				that.removeSpinner();
			}
		});

		this.addSpinner('#sign-in');
	},	

// User sign-up
	signUp: function (event) {
		event.preventDefault();
		var that = this;

		var username = $('#inputUsername').val();
		var password = $('#inputPassword').val();
		var passCheck = $('#reInputPassword').val();

		var user = new Bucket.Models.User({
			username: username
		});


		this.addSpinner('#sign-up');
		user.save({pass: password, passCheck: passCheck}, {
			success: function (req, res) {
				that.currentUser = res;
				console.log(that.currentUser);
				Bucket.todos.fetch({
					success: function () {
						that.render();
					}
				});
				that.removeSpinner();
			},
			error: function (req, res) {
				that.showError('#sign-up', 'Passwords do not match', 'login');
				that.removeSpinner();
			}
		})

	},

// User sign-out
	logOut: function (event) {
		event.preventDefault();
		var that = this;

		$.ajax({
			url: 'api/session',
			type: 'DELETE',
			dataType: 'json',
			success: function (req, res) {
				that.currentUser = null;
				that.render();
			},
			error: function (req, res) {
				debugger
			}
		})

		// this.currentUser = null;
		// this.render();
	},

// Utility Functions
	showError: function (selector, message, type) {
		$('.fa-spin').remove();
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

	addSpinner: function (container) {
		$(container).append("<i class='fa fa-cog fa-spin'></i>");
	},

	removeSpinner: function () {
		$('.fa-spin').remove();

	}


});

