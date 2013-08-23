App.populator('history', function(page, args) {
	var MonthView = Backbone.View.extend({
		tagName: 'li',
		className: 'transaction',
		template: '#history-month-template',
		initialize: function( month ) {
			this.template = _.template( $( this.template.html() ) );
		},
		render: function() {
			this.$el.empty().html( this.template( this.transactions.toJSON() ))
			return this.$el;
		}
	});

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
			
		function showMonth( month, category ) {
			var transactions = CashTrack.request('transactions', category, month);
			if( transactions.length == 0)
				return true; // No transactions in this category this month
			
			/*			
			if( !min || start < min )
				return false;
			*/
			
			var $container = $('<ul>').addClass('app-list transactions');
			var $section = $('<li>').addClass('app-section month');
			
			$.when( CashTrack.request('transactions', category, month) )
			 .then( function( transactions) {
				transactions.each(function( transaction ) {
					var category = categories.get( transaction.destination );
					var $item = $('<li>').addClass('transaction');
						$item.append( $('<span>').addClass('date').text( Globalize.format( transaction.date, 'ddd, d.') ) );
						$item.append( $('<span>').addClass('color').css({
							'background-color': category.color,
							'border-color': darken( category.color, 50)
						}) );
						$item.append( $('<span>').addClass('name').text( category.name ) );
						$item.append( $('<span>').addClass('amount').text( Globalize.format( transaction.amount, 'c' ) ) );
						
						$item.appendTo( $container );
						
						$item.on('click', function() {
							App.load('transaction', {id: transaction.id } );
						});
				});
			});
			
			var $header = $('<div>').addClass('header');
				$header.append( $('<div>').text('›').addClass('expand') );
				if( (new Date).getYear() == start.getYear() )
					$header.append( $('<div>').addClass('name').text( Globalize.format( start, 'MMMM') ) );
				else
					$header.append( $('<div>').addClass('name').text( Globalize.format( start, 'MMMM, yyyy') ) );
					
				$header.append( $('<div>').addClass('amount').text( Globalize.format( transactions.sum, 'c') ) );
				$header.click( function() {
					var $element = $( this ).closest('.month');
					if( $element.hasClass('expanded') ) {
						$element.data('height', $element.find('.transactions').height());
						$element.removeClass('expanded').addClass('folded');
						$element.find('.transactions').css('height', '0px');
					} else {
						$element.addClass('expanded').removeClass('folded');
						$element.find('.transactions').css('height', $element.data('height') + 'px' );
					}
				});
				
			
			$section.append( $header );
			$section.append( $container );
			
			$( page ).find('.history').append( $section );
			
			if( month == 0 ) {
				$section.addClass('expanded');
				$container.css('height', $container.height() + 'px');
			} else {
				$section.addClass('folded')
						.data('height', $container.height());
				$container.height(0);
			}
			
			if( $container.children().length == 0 )
				$section.addClass( 'empty' );
			
			return true;
		}
		
		$( page ).find('.history').empty();
		var i = 0;
		while( showMonth( i++) && i < 2 )
			i++;
	});
});