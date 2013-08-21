App.populator('history', function(page, args) {
	$( page ).on('appShow', function() {
		
		var categories = CashTrack.request('categories');
		
		var select = $( page ).find('.category').empty();
		select.append( $('<option>').attr('value', '').text( 'Alle' 	) );
		_.each( categories, function( category ) {
			select.append( $('<option>').attr('value', category.id).text( category.name) );
		});
		
		select.on('change', function( ) {
			$( page ).find('.history').empty();
			var i = 0;
			while( showMonth( i++, this.value) )
			;
		});
		
		function showMonth( months, category ) {
					
			var start = new Date();
			start.setDate(1);
			start.setHours(0, 0, 0, 0);
			var end = new Date();
				end.setMonth( start.getMonth() + 1 );
				end.setDate(1);
				end.setHours(0, 0, 0, 0);
			
			end.setMonth( end.getMonth() - months );
			start.setMonth( start.getMonth() - months );
			
			var trans = CashTrack.request('transactions', category ? { destination: {$eq: category} } : null);
			
			trans = _.sortBy( trans, 'date').reverse();
			
			if( !trans.length )
				return false;
				
			var min = new Date( _.min( trans, function( transaction ) { return new Date( transaction.date); }).date );
				min.setDate(1)
				min.setHours(0, 0, 0, 0);
			
			if( !min || start < min )
				return false;
			
			var $container = $('<ul>').addClass('app-list transactions');
			var $section = $('<li>').addClass('app-section month');
			
			var sum = 0.0;
			_.each( trans, function( transaction ) {
				var date = new Date(transaction.date);
				if( !(start <= date && date <= end) )
					return;
				
				sum += transaction.amount;
				
				var c = CashTrack.request('category', parseInt(transaction.destination) );
				
				var $item = $('<li>').addClass('transaction');
					$item.append( $('<span>').addClass('date').text( Globalize.format( new Date(transaction.date), 'ddd, d.') ) );
					$item.append( $('<span>').addClass('color').css({'background-color': c.color, 'border-color': darken( c.color, 50) }) );
					$item.append( $('<span>').addClass('name').text( c.name ) );
					$item.append( $('<span>').addClass('amount').text( Globalize.format( transaction.amount, 'c' ) ) );
					
					$item.appendTo( $container );
					
					$item.on('click', function() {
						App.load('transaction', {id: transaction.id } );
					});
			});
			
			var $header = $('<div>').addClass('header');
				$header.append( $('<div>').text('›').addClass('expand') );
				if( (new Date).getYear() == start.getYear() )
					$header.append( $('<div>').addClass('name').text( Globalize.format( start, 'MMMM') ) );
				else
					$header.append( $('<div>').addClass('name').text( Globalize.format( start, 'MMMM, yyyy') ) );
				$header.append( $('<div>').addClass('amount').text( Globalize.format( sum, 'c') ) );
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
			
			if( months == 0 ) {
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
		while( showMonth( i++) )
			;
	});
});