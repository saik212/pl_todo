window.Bucket = {
	Models: {},
	Collections: {},
	Views: {},
	Routers: {},
	
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

		
	}

};


$(document).ready(function () {
	Bucket.initialize();
});