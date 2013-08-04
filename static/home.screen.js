CashTrack.module('Home.Screen', function(HomeScreen, CashTrack, Backbone, Marionette, $, _) {
	
	HomeScreen.TransactionAddView = Marionette.ModalView.extend({
		template: '#template-transaction',
		ui: {
			value: '.body .value',
		},
		initialize: function( options ) {
			this.model = new Backbone.Model({source: options.source, destination: options.destination});
			this.title = this.model.get('source').get('name') + ' > ' + this.model.get('destination').get('name');
			
			this.$el.on('keypress', $.proxy(this._onKeyPress, this));
			this.value = 0.00;
		},
		_onKeyPress: function( e ) {
			if( [
				'0', '1', '2', '3',
				'4', '5', '6', '7',
				'8', '9', ',', '.',
			].indexOf( String.fromCharCode( e.which ) ) !== -1 ) {
				return; 
			} else if( [
				'+', '*', '-',
			].indexOf( String.fromCharCode( e.which ) ) !== -1 ) {
				var tmp = parseFloat( this.ui.value.val() );
				if( this.operator ) {
					switch( this.operator ) {
						case '+': this.value += tmp; break;
						case '*': this.value *= tmp; break;
						case '-': this.value -= tmp; break;
						case undefined: this.value = tmp; break;
						default:
							throw new Error('Invalid operator');
					}
				} else {
					this.value = tmp;
				}
				
				this.operator = String.fromCharCode( e.which );
				this.ui.value.val( this.value );
				e.preventDefault();
			} else if( String.fromCharCode( e.which ) == '=' ) {
				this.ui.value.val( '' + this.value );
				e.preventDefault();
			}
		}
	});
	
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
						return $(this).clone().addClass('helper').data('source', self.model );
					},
				});
			}
			
			if( this.model.get('type') != 'income' )  {
				this.$el.droppable({
					accept: '.node',
					hoverClass: 'drop-hover',
					drop: function(event, ui) {
						var source = ui.helper.data('source');
						
						CashTrack.dialog.show( new HomeScreen.TransactionAddView({
							source: source,
							destination: self.model,
						}));
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