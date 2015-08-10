// Keep the Backbone entry-point as clean as possible.
// In larger applications, Model and Collections would be abstracted to seperate files.

window.Bucket = {
	Models: {},
	Collections: {},
	Views: {},
	
	initialize: function() {
		if (Parse.User.current()) {
			var currentUser = Parse.User.current().attributes.username;
		}
		// set Models constructor
		Bucket.Models.Todo = Backbone.Model.extend({
			urlRoot: 'api/todos'
		});

		// set Collections constructor
		Bucket.Collections.Todos = Backbone.Collection.extend({
			url:'api/todos',
			model: Bucket.Models.Todo
		});


		// Fetch and hold onto todos collection at the start so it can be worked with right away.
		Bucket.todos = new Bucket.Collections.Todos();
		Bucket.todos.fetch({data: {user: currentUser}});


		// Only one view in this application so no need to swap main views
		// Bucketlist view on another file due to size
		Bucket.mainView = new Bucket.Views.Main({el: "#content"});
	}

};

Parse.initialize("U6by9eTVp9ZiAgsGruUpnhL8RIJXxc4ka9Y3niP9", "rHVii2SEnus7m0dHHthdRSxbsnzG0nOkkGVgjuTu");

$(document).ready(function () {
	Bucket.initialize();
});