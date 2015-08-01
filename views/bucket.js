window.Bucket = {
	Models: {},
	Collections: {},
	Views: {},
	
	initialize: function() {
		console.log('Hello World, from Backbone!');

		// set Models constructor
		Bucket.Models.Todo = Backbone.Model.extend({
			urlRoot: 'api/todos'
		});

		// set Collections constructor
		Bucket.Collections.Todos = Backbone.Collection.extend({
			url:'api/todos'
		});

		Bucket.todos = new Bucket.Collections.Todos();
		Bucket.todos.fetch();

		Bucket.mainView = new Bucket.Views.List({el: "#content"});
	}

};


$(document).ready(function () {
	Bucket.initialize();
});