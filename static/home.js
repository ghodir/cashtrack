CashTrack.module('Home', function(Home, CashTrack, Backbone, Marionette, $, _) {
	Home.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'': 'showHomeScreen',
		}
	});
	
	var API = {
		showHomeScreen: function() {
			
		}
	}
});