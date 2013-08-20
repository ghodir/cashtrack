App.populator('overview', function(page, args) {
	var template = $(page).find('.categories .template').removeClass('template').remove();
	
	$( page ).on('appShow', function() {
		$(page).find('.categories').empty();
		
		var now = new Date(), y = now.getFullYear(), m = now.getMonth();
		var start = new Date(y, m, 1);
		var end   = new Date(y, m + 1, 0);
		
		
		var sum = 0.00;
		var amounts = {};
		var transactions = CashTrack.request('transactions', { date: {	$gte: start, $lt: end } });
		_.each( transactions, function( transaction ) {
			sum += transaction.amount;
			if( amounts[ transaction.destination ] )
				amounts[ transaction.destination ] += transaction.amount;
			else
				amounts[ transaction.destination ] = transaction.amount;
		});
		
		var max = 0.0;
		var percentages = [];
		var categories = CashTrack.request('categories');
		_.each( categories, function( category ) {
			category.amount = amounts[ category.id ] / sum;
			if( category.amount > max )
				max = category.amount;
		});
		
		categories = _.sortBy( categories, 'amount').reverse();
		$( page ).find('.month').text( Globalize.format( start, 'MMMM') );
		$( page ).find('.expenses').text( Globalize.format( sum, 'c' ) );
		
		var container = $(page).find('.categories').empty();
		for( var index in categories ) {
			var category = categories[index];
			var item = $(template[0].cloneNode(true));
				item.data('category', category.id );
				item.addClass(category.color);
				item.find('.name').text( category.name );
				item.find('.amount').text( Globalize.format( amounts[ category.id ], 'c' ) );
				container.append( item );
				
				// Trigger page reflow ( taken from zepto )
				item.size() && item.get(0).clientLeft
				item.find('.bar').css({
					'background-color': category.color,
					'border-color': darken( category.color, 50),
					'width': category.amount / max * 100.0 + '%'
				});//.removeClass('empty');
		}
	});
	
}, function(page, args) {

});