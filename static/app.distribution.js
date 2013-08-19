App.populator('distribution', function(page, args) {
	$(page).on('appShow', function() {
		var categories = CashTrack.request('categories', 0);
		
		var items = []
		_.each(categories, function( category ) {
			items.push({
				value: category.amount,
				color: category.color,
				label: category.name
			});
		});
		
		var $chart = $( page ).find('.chart');
			$chart.css({
				width: '200px',
				height: '200px'
			});
			
		this.paper ? this.paper.clear() : ( this.paper = Raphael( $chart[0] ) );
		this.paper.drawPieChart(100, 100, 100, items);
		
		var months = $( page ).find('.months');
		for(var i = 0; i < 12; i++) {
			$('<option>').attr('value', i).text( Globalize.culture().calendars.standard.months.names[i] ).appendTo( months );
		}
		
		var years = $( page).find('.years');
		var transactions = CashTrack.request('transactions');
		transactions = _.sortBy( transactions, 'date');
		var min = transactions[0].date.getFullYear(), max = transactions[ transactions.length - 1].date.getFullYear();
		for( var i = min; i <= max; i++ ) {
			$('<option>').attr('value', i).text( i ).appendTo( years );
		}
		
		var container = $( page ).find('.categories');
		_.each( categories, function( category ) {
			var $item = $('<li>').addClass('category').appendTo( container );
				$item.append( $('<span>').addClass('color').css({'background-color': category.color, 'border-color': darken( category.color, 50) }) );
				$item.append( $('<span>').addClass('name').text( category.name ) );
				$item.append( $('<span>').addClass('percentage').text( Globalize.format( category.amount / categories.sum, 'p')) );
				$item.append( $('<span>').addClass('amount').text( Globalize.format( category.amount, 'c') ) );
				
				
		});
		
	});
}, function() {
	this.paper && this.paper.remove();
});