Bucket.Views.List = Backbone.View.extend({
	initialize: function (options) {
		this.list = $('.todos');
		this.listenTo(Bucket.todos, 'sync', this.render);
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
		console.log(text);
		console.log('Trying to add a todo!');
	},

	deleteTodo: function (event) {
		event.preventDefault();
		
		var todoId = $(event.target).data('id');
		console.log('delete todo #'+todoId);
	},

	updateTodo: function (event) {
		event.preventDefault();
		
		var todoId = $(event.target).data('id');
		console.log('update todo #:'+todoId);
	}
});