CashTrack.module('Entities', function(Entities, CashTrack, Backbone, Marionette, $, _) {
	
	Entities.Node = Backbone.Model.extend({
	
	});
	
	Entities.NodeCollection = Backbone.Collection.extend({
		model: Entities.Node,
		url: '/api/users/1/nodes',
	});
	
	CashTrack.reqres.setHandler('node', function(id) {
		var node  = new Entities.Node({id: id});
		var defer = $.Deferred();
		    node.fetch({
				success: function(data) {
					defer.resolve(data);
				},
				error: function() {
					CashTrack.trigger('error');
				}
			});
			
		return defer.promise();
	});
	
	CashTrack.reqres.setHandler('nodes', function(id) {
		var nodes = new Entities.NodeCollection();
		var defer = $.Deferred();
		    nodes.fetch({
				success: function( data ) {
					defer.resolve(data);
				},
				error: function() {
					CashTrack.trigger('error');
				}
			});
		return defer.promise();
	});
});