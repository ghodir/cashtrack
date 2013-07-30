CashTrack.module('Home.Screen', function(HomeScreen, CashTrack, Backbone, Marionette, $, _) {
	
	HomeScreen.NodeView = Marionette.ItemView.extend({
		template: '#template-node',
		className: 'node',
		onShow: function() {
			var self = this;
			this.$el.addClass( this.model.get('color') );
			
			if( this.model.get('type') == 'income' || this.model.get('type') == 'account' )  {
				this.$el.draggable({
					stack: '.node',
					revert: 'invalid',
					helper: function() {
						return $(this).clone().addClass('helper').data('source', self.model.get('id') );
					},
				});
			}
			
			if( this.model.get('type') != 'income' )  {
				this.$el.droppable({
					accept: '.node',
					hoverClass: 'drop-hover',
					drop: function(event, ui) {
						var source = ui.helper.data('source');
						console.log( source + ' -> ' + self.model.get('id') );
					}
				});	
			}
		}
	});
	
	HomeScreen.SectionView = Marionette.CollectionView.extend({
		itemView: HomeScreen.NodeView,
	});
	
	HomeScreen.Layout = Marionette.Layout.extend({
		template: '#template-home-screen',
		regions: {
			goals: '.goals .nodes',
			income: '.income .nodes',
			accounts: '.accounts .nodes',
			categories: '.categories .nodes',
		}
	});
	
	HomeScreen.Controller = {
		show: function() {
			var layout = new HomeScreen.Layout();
			var promise = CashTrack.request('nodes');
			
			$.when(promise)
			 .then(function(nodes) {
				var goals = new CashTrack.Entities.SubTypeCollection(nodes, 'goal');
				var incomes = new CashTrack.Entities.SubTypeCollection(nodes, 'income');
				var accounts = new CashTrack.Entities.SubTypeCollection(nodes, 'account');
				var categories = new CashTrack.Entities.SubTypeCollection(nodes, 'category');
				
				layout.on('show', function() {
					console.log('Showing Sections', nodes.toJSON());
					layout.goals.show( new HomeScreen.SectionView({collection: goals}) );
					layout.income.show( new HomeScreen.SectionView({collection: incomes}) );
					layout.accounts.show( new HomeScreen.SectionView({collection: accounts}) );
					layout.categories.show( new HomeScreen.SectionView({collection: categories}) ); 
				});
				
				console.log( 'Showing Layout');
				CashTrack.content.show( layout );
			 });
		}
	};
});