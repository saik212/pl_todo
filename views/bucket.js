// Keep the Backbone entry-point as clean as possible.
// In larger applications, Model and Collections would be abstracted to seperate files.

window.Bucket = {
	Models: {},
	Collections: {},
	Views: {},
	
	initialize: function() {

		// set Model constructora
		Bucket.Models.Todo = Backbone.Model.extend({
			urlRoot: 'api/todos'
		});

		Bucket.Models.User = Backbone.Model.extend({
			urlRoot: 'api/users'
		});

		Bucket.Models.CurrentUser = Backbone.Model.extend({
			urlRoot: 'api/session'
		});

		// set Collection constructors
		Bucket.Collections.Todos = Backbone.Collection.extend({
			url:'api/todos',
			model: Bucket.Models.Todo
		});


		// Fetch and hold onto todos collection at the start so it can be worked with right away.
		Bucket.todos = new Bucket.Collections.Todos();
		Bucket.todos.fetch();


		Bucket.currentUser = new Bucket.Models.CurrentUser();
		Bucket.currentUser.fetch({
			success: function (req, res) {
				console.log('hello world from currentUser fetch! Success');
				Bucket.mainView = new Bucket.Views.Main({el: "#content", currentUser: res});		
			},
			error: function (req, res) {
				console.log('hello world from currentUser fetch! Error!');
				Bucket.mainView = new Bucket.Views.Main({el: "#content"});		
			}
		});

		// Only one view in this application so no need to swap main views
		// Bucketlist view on another file due to size
	}

};

// Using the keys here is just for convenience. In a real setting, I would use third-party modules
// like Figaro to hide the keys and only use them in a production environment.
// Parse is used on the client side for ease of use with the User.current() object. All communication
// with Parse would realistically be dealt with on the server, and I would create a CurrentUser model in Backbone
// which would communicate to the server

$(document).ready(function () {
	Bucket.initialize();
});