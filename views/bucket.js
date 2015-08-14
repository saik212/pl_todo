// Keep the Backbone entry-point as clean as possible.
// In larger applications, Model and Collections would be abstracted to seperate files.

window.Bucket = {
	Models: {},
	Collections: {},
	Views: {},
	
	initialize: function() {

		// set Model constructora
		Bucket.Models.List = Backbone.Model.extend({
			urlRoot: 'api/lists'
		});

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

		Bucket.Collections.Lists = Backbone.Collection.extend({
			url:'api/lists',
			model: Bucket.Models.List
		});


		Bucket.todos = new Bucket.Collections.Todos();
		Bucket.lists = new Bucket.Collections.Lists();



		Bucket.currentUser = new Bucket.Models.CurrentUser();
		Bucket.currentUser.fetch({
			success: function (req, res) {
				console.log('hello world from currentUser fetch! Success');
				Bucket.lists.fetch({
					success: function () {
						var listId = '';
						if (Bucket.lists.length > 0) {
							listId = Bucket.lists.toJSON()[0].id;
						}
						Bucket.todos.fetch({data: { listId: listId }});
						Bucket.mainView = new Bucket.Views.Main({el: "#content", currentUser: res});		
					}
				});
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

$(document).ready(function () {
	Bucket.initialize();
});