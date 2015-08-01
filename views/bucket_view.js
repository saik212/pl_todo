Bucket.Views.List = Backbone.View.extend({
	initialize: function (options) {
		this.list = $('.todos');
		this.listenTo(Bucket.todos, 'sync add remove', this.render);
	},

	events: {
		"click .add-btn": "addTodo",
		"click .dlt": "deleteTodo",
		"click .updt": "updateTodo"
	},

	render: function () {
		this.list.empty();
		this.renderTodos();
	},

	renderTodos: function () {
		var that = this;
		Bucket.todos.forEach(function (todo) {
			var todoTemplate = "<li class='todo'><span>"+todo.get('desc')+
						"</span><span><i data-id="+todo.id+" class='updt fa fa-check-square-o'>Complete</i><i data-id="+todo.id+
						" class='dlt fa fa-trash'>Delete</i></span></li>";
			that.list.append(todoTemplate);
		});


	},

	addTodo: function (event) {
		event.preventDefault();

		var text = $('.new-todo').val();
		var todo = new Bucket.Models.Todo({desc: text});
		todo.save({}, {
			success: function () {
				Bucket.todos.add(todo);
				console.log("Added todo");
			},
			error: function (req, res) {
				console.log('Errored out');
				console.log(res);
			}
		})
	},

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

	updateTodo: function (event) {
		event.preventDefault();
		
		var todoId = $(event.target).data('id');
		console.log('update todo #:'+todoId);

		var todo = new Bucket.Models.Todo({id: todoId});
		todo.fetch({
			success: function () {
				if (todo.get('complete') === false) {
					todo.set({complete: true});
					todo.save({}, {
						success: function () {
							console.log('saved completion');
						}
					});
				} else {
					console.log('cannot reinstate todo');
				}
			}
		});
	}
});