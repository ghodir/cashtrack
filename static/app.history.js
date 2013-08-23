App.populator('history', function(page, args) {
	var TransactionView = Backbone.View.extend({
		tagName: 'li',
		className: 'transaction',
		template: '#history-transaction-template',
		events: {
			'click': 'onClick',
		},
		initialize: function( options ) {
			this.template = _.template( $( this.template ).html() );
			
			this.categories = options.categories;
			this.transaction = options.transaction;
		},
		render: function() {
			var data = this.transaction.toJSON();
				data.darken = darken;
				data.format = function() { return Globalize.format.apply( Globalize, arguments); };
				data.categories = {},
				this.categories.each(function( category ) {
					data.categories[ category.id ] = category.toJSON();
				});
			this.$el.empty().html( this.template( data ) );
			return this.$el;
		},
		onClick: function() {
			App.load('transaction', {id: this.transaction.get('id') } );
		}
	});

	var MonthView = Backbone.View.extend({
		tagName: 'li',
		className: 'app-section month',
		template: '#history-month-template',
		events: {
			'click': 'toggle',
		},
		initialize: function( options ) {
			this.template = _.template( $( this.template).html() );
			
			this.items = [];
			this.month = options.month;
			this.categories = options.categories;
			this.transactions = options.transactions;
			this.transactions.forEach(function( transaction ) {
				this.items.push( new TransactionView( {categories: this.categories, transaction: transaction} ) );
			}, this);
		},
		render: function() {
			this.$el.empty().html( this.template( {
				month: this.month,
				amount: this.transactions.sum,
				transactions: this.transactions.toJSON(),
				format: function() {
					return Globalize.format.apply(Globalize, arguments);
				},
			}) );
			
			var $container = this.$el.find('.transactions');
			_.each(this.items, function( item ) {
				$container.append( item.render() );
			},this);
			
			this.fold();
			
			if( this.transactions.length == 0 )
				this.$el.addClass('empty');
				
			return this.$el;
		},
		toggle: function() {
			if( this.$el.hasClass('empty') )
				return;
				
			if( this.$el.hasClass('expanded') )
				this.fold();
			else
				this.expand();
		},
		expand: function() {
			this.$el.addClass('expanded').removeClass('folded');
			this.$el.find('.transactions').css('height', this.$el.data('height') + 'px' );
		}, 
		fold: function() {
			this.$el.data('height', this.$el.find('.transactions').height());
			this.$el.removeClass('expanded').addClass('folded');
			this.$el.find('.transactions').css('height', '0px');
		}
	});
	
	function showHistoryByCategory( category ) {
		var d = $.Deferred();
		
		$.when( CashTrack.request('transactions', category), CashTrack.request('categories') )
		 .then( function(transactions, categories) {
			var now = new Date();
			var groups = transactions.groupBy(function( transaction ) {
				return ( new Date(now - transaction.get('date')) ).getMonth();
			});
			
			var views = [];
			var $history = $( page ).find('.history');
			_.each( groups, function( transactions, month ) {
				transactions = new CashTrack.entities.Transactions( transactions );
				var view = new MonthView( {month: month, categories: categories, transactions: transactions} );
				$history.append( view.$el ); // Attach first for MonthView.toggle to work properly
				view.render()
				views.push( view );
			});
			
			views[0].expand();
			d.resolve( views );
		 });
		 
		return d.promise();
	}
	
	$( page ).on('appShow', function() {
		
		var categories = CashTrack.request('categories');
			
		var select = $( page ).find('.category').empty()
			select.append( $('<option>').attr('value', '').text( 'Alle' ) )
					.on('change', function( ) {
						$( page ).find('.history').empty();
						var i = 0;
						while( showMonth( -i, this.value) && i < 2 )
							i++;
					});

		_.each( categories, function( category ) {
			select.append( $('<option>').attr('value', category.id).text( category.name) );
		})
			
		page.views && _.each(page.views, function( view ) { view.remove(); });
	
		$.when( showHistoryByCategory( undefined ) )
		 .then( function( views ) {
			page.views = views;
		 });
	});
}, function( page ) {
	_.each(page.views, function( view ) {
		view.remove();
	});
	
	delete page.views;
});