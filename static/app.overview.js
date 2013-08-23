App.populator('overview', function(page, args) {
	var template = $(page).find('.categories .template').removeClass('template').remove();
	
	$( page ).on('appShow', function() {
		$(page).find('.categories').empty();
		
		var container = $(page).find('.categories').empty();
		$.when( CashTrack.request('categories', 0) )
		 .then( function( categories ) {
			$( page ).find('.month').text( Globalize.format( new Date(), 'MMMM') );
			$( page ).find('.expenses').text( Globalize.format( categories.sum, 'c' ) );
		
			categories.sortBy('amount').reverse().each(function( category, index, list) {
				
				var item = $(template[0].cloneNode(true));
					item.data('category', category.id );
					item.addClass(category.color);
					item.find('.name').text( category.name );
					item.find('.amount').text( Globalize.format( category.amount, 'c' ) );
					container.append( item );
					
					// Trigger page reflow ( taken from zepto )
					item.size() && item.get(0).clientLeft
					item.find('.bar').css({
						'background-color': category.color,
						'border-color': darken( category.color, 50),
						'width': category.amount / list[0].amount * 100.0 + '%'
					});
			});
		 });
	});
	
}, function(page, args) {

});