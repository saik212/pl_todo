// This view takes care of CRUD operations on the front-end and communicates with the server for data.
// The view is re-rendered when changes are made to the collection. If a single model is updated, the collection is
// re-fetched, and the view is re-rendered. This can be done in a better manner by having subviews or composite views,
// allowing for only certain parts of the page re-rendered when necessary


Bucket.Views.Main = Backbone.View.extend({

	initialize: function (options) {
		this.currentList = Bucket.lists.toJSON()[0] || {};
		// debugger
		this.currentUser = options.currentUser || null;
		if (!this.currentUser) {
			this.render();
		}

		this.listenTo(Bucket.todos, 'sync add remove', this.render);
		this.listenTo(Bucket.lists, 'sync add remove', this.render);

	},


	events: {
		"click .list-drop": "changeList",
		"click .create-list": "addList",
		"click .delete-list": "deleteList",
		"click .create-todo": "addTodo",
		"click #dlt-todo": "deleteTodo",
		"click #updt-todo": "updateTodo",
		"click #sign-in": "signIn",
		"click #sign-up": "signUp",
		"click .logout": "logOut"
	},

	changeList: function (event) {
		event.preventDefault();
		var that = this;

		var listId = $(event.target).data('id');
		var listTitle = $(event.target).text();

		this.currentList.createdBy = Bucket.currentUser.get('username');
		this.currentList.title = listTitle;
		this.currentList.id = listId;
		Bucket.todos.fetch({data: {listId: listId}});
	},

	addList: function (event) {
		event.preventDefault();
		var that = this;

		var listTitle = $('.new-list').val();
		that.addSpinner($(event.target));
		var list = new Bucket.Models.List({title: listTitle});
		list.save({}, {
			success: function (req, res) {
				Bucket.lists.add(list);

				that.currentList.createdBy = Bucket.currentUser.get('username');
				that.currentList.title = list.get('title');
				that.currentList.id = list.get('objectId');
				Bucket.todos.fetch({data: {listId: list.get('objectId')}});
			}
		});
	},

	deleteList: function (event) {
		event.preventDefault();
		var that = this;

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
        "<input id='inputUsernameSU' class='form-control' placeholder='Username'>"+
        "<label for='inputPassword' class='sr-only'>Password</label>"+
        "<input type='password' id='inputPasswordSU' class='form-control' placeholder='Password'>"+
        "<label for='reInputPassword' class='sr-only'>Re-Enter Password</label>"+
        "<input type='password' id='reInputPassword' class='form-control' placeholder='Re-Enter Password'>"+
        "<button class='btn btn-lg btn-primary btn-block' id='sign-up' type='submit'>Sign Up</button>"+
	      "</form>";


    $(this.el).html(formTemplate);
	},

	renderContent: function () {
		this.renderLogOut();
		this.renderLists(Bucket.lists);
		this.renderListForm();
		if (Bucket.lists.length > 0) {
			this.renderTodos(Bucket.todos);
		}

	},


// It would be cleaner and safer to use a templating engine like EJS to account for DRY code as well as
// HTML escaping. Having the HTML here is purely for convenience in this demonstration.



// Adding a to-do: trigger event, grab text from input field, set description as attribute for new model, save model
	addTodo: function (event) {
		event.preventDefault();
		var that = this;

		var text = $('.new-todo').val();
		var todo = new Bucket.Models.Todo({desc: text, createdBy: this.currentUser.username, listId: this.currentList.id});
		that.addSpinner($(event.target));
		todo.save({}, {
			success: function (req, res) {
				todo.set({id: res.objectId});
				Bucket.todos.add(todo);
			},
			error: function (req, res) {
				that.render();
			}
		});

	},


// Deleting a to-do: trigger event, grab id from event.target, find model by id, destroy model and remove it from the collection
	deleteTodo: function (event) {
		event.preventDefault();
		var that = this;
		
		var todoId = $(event.target).data('id');
		// that.addSpinner('.todo'+todoId);

		var todo = new Bucket.Models.Todo({id: todoId});
		that.addSpinner($(event.target));
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
		that.addSpinner($(event.target));
		todo.fetch({
			success: function () {
				if (todo.get('complete') === false) {
					todo.set({complete: true});
					todo.save({}, {
						success: function (todo) {
							Bucket.todos.fetch({
								data: {listId: that.currentList.id},
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
					that.removeSpinner();
					$(event.target).parent().append("<span class='updt-error' style='float:right;margin-right:10px;color:red'>Cannot reinstate todo</span>");
					window.setTimeout(function () {
						$('.updt-error').remove();
					}, 1000);
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
				Bucket.lists.fetch({
					success: function (req, res) {
						// debugger
						that.currentList = Bucket.lists.toJSON()[0];
						Bucket.todos.fetch({
							data: {listId: Bucket.lists.toJSON()[0].id},
							success: function () {
								that.removeSpinner();
							}
						});
						
					}
				})

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

		var username = $('#inputUsernameSU').val();
		var password = $('#inputPasswordSU').val();
		var passCheck = $('#reInputPassword').val();

		var user = new Bucket.Models.User({
			username: username
		});


		this.addSpinner('#sign-up');
		user.save({pass: password, passCheck: passCheck}, {
			success: function (req, res) {
				that.currentUser = res;
				console.log(that.currentUser);
				Bucket.lists.fetch();
				Bucket.todos.fetch({
					data: {listId: ""},
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

	},


	renderLogOut: function () {
		var template = "<button type='button' class='btn btn-danger logout' style='display:block;margin-bottom:20px'>Sign Out</button>";
		$(this.el).append(template);
	},

	renderLists: function (lists) {
		var template = "<div class='dropdown' style='float:left'>"+
							"<button class='btn btn-default dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>"+
							this.currentUser.username+"'s Lists<span class='caret'></span></button>"+
							"<ul class='dropdown-menu' aria-labelledby='dropdownMenu1'>"+
							"</ul></div>";

		$(this.el).append(template);
		lists.forEach(function (list) {
			var list_item = "<li><a class='list-drop' data-id="+list.get('id')+">"+list.get('title')+"</a></li>";
			$('.dropdown-menu').append(list_item);
		});
	},

	renderListForm: function () {
		var template = "<div class='input-group' style='width:315px;float:left'>"+
							"<input type='text' class='form-control new-list' placeholder='List Title'>"+
							"<span class='input-group-btn'>"+
							"<button class='btn btn-default create-list' type='button'>Create List</button></span></div>";

		$(this.el).append(template);
	},

	renderTodos: function (todos) {
		var template = "<ul class='container list-group todos-container' style='width:700px;float:right'></ul>";
		var todoForm = "<li class='list-group-item'><div class='input-group'>"+
							"<input type='text' class='form-control new-todo' placeholder='Add a todo'>"+
							"<span class='input-group-btn'>"+
							"<button class='btn btn-default create-todo' type='button'>Add!</button></span></div></li>";

		$(this.el).append(template);
		$('.todos-container').append("<li class='list-group-item' style='text-align:center;font-weight:bold;font-size:30px'>"+this.currentList.title+"</li>");
		todos.forEach(function (todo) {
			var classComp = '';
			var updateText = 'Mark Complete';
			if (todo.get('complete') === true) {
				classComp = "list-group-item-success";
				updateText = 'Mark Incomplete'
			}
			var listItem = "<li class='list-group-item "+classComp+"'>"+todo.get('desc')+"<span class='badge btn' id='dlt-todo' data-id="+todo.get('id')+">Delete</span><span class='badge btn' id='updt-todo' data-id="+todo.get('id')+">"+updateText+"</span></li>"
			$(".todos-container").append(listItem);
		});
		$(".todos-container").append(todoForm);

	}


});

