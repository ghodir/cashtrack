CashTrack.module('Home', function(Home, CashTrack, Backbone, Marionette, $, _) {
	Home.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'': 'showHomeScreen',
		}
	});
	
	var API = {
		showHomeScreen: function() {
			Home.Screen.Controller.show();
		}
	}
	
	CashTrack.on('home:show', function() {
		CashTrack.navigate('');
		API.showHomeScreen();
	});
	
	CashTrack.addInitializer(function() {
		new Home.Router({
			controller: API,
		});
	});
});