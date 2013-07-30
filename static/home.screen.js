CashTrack.module('Home.Screen', function(HomeScreen, CashTrack, Backbone, Marionette, $, _) {

	HomeScreen.Controller = Marionette.Controller.extend({
		show: function() {
			var layout = new HomeScreen.Layout();
			var nodes = CashTrack.request('nodes');
			
			var incomes = new CashTrack.Entities.SubTypeCollection('nodes', 'income');
		}
	});
});