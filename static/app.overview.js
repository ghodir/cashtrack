App.populator('overview', function(page, args) {
	var template = $(page).find('.categories .template').removeClass('template').remove();
	
	$( page ).on('appShow', function() {
		$(page).find('.categories').empty();
		
		var container = $(page).find('.categories').empty();
		$.when( CashTrack.request('categories', 0) )
		 .then( function( categories ) {
			$( page ).find('.month').text( Globalize.format( new Date(), 'MMMM') );
			$( page ).find('.expenses').text( Globalize.format( categories.sum, 'c' ) );
		
			categories.sortBy('amount').reverse().forEach(function( category, index, list) {
				
				var item = $(template[0].cloneNode(true));
					item.data('category', category.get('id') );
					item.addClass(category.get('color'));
					item.find('.name').text( category.get('name') );
					item.find('.amount').text( Globalize.format( category.get('amount'), 'c' ) );
					container.append( item );
					
					// Trigger page reflow ( taken from zepto )
					item.size() && item.get(0).clientLeft
					item.find('.bar').css({
						'background-color': category.get('color'),
						'border-color': darken( category.get('color'), 50),
						'width': category.get('amount') / list[0].get('amount') * 100.0 + '%'
					});
			});
		 });
	});
	
}, function(page, args) {

});