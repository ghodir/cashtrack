App.populator('newtransaction', function(page, args) {
	
	$(page).find('.back').on('click', function() {
		App.back();
	});
	
	$(page).on('keydown', function( e ) {
		if( e.which == 27 )
			App.back();
		else if( e.which == 13 )
			$(page).find('.save').trigger('click');
			
	}); 
	
	$(page).find('.save').on('click', function() {
		var errors = {};
		var transaction = CashTrack.request('transaction.create');
			transaction.amount = $(page).find('.amount').val();
			transaction.destination = $(page).find('.category.selected').data('category');
			transaction.date = $( page ).find('.date').val();
			transaction.notes = $( page ).find('.notes').val();
		
		transaction.amount = Globalize.parseFloat(transaction.amount);
		if( !transaction.amount ) {
			var node = $( page ).find('.amount').addClass('error')[0];
			var val = $( page ).find('.amount').addClass('error').val();
			
			if( node.createTextRange ) {
				var range = node.createTextRange();
					range.collapse(true);
					range.moveEnd( val.length );
					range.moveStart( val.length );
			}else if( node.setSelectionRange ) {
				node.setSelectionRange( val.length, val.length );
			} else {
				$( page ).find('.amount').addClass('error').focus();
			}
			
			return;
		}
		
		switch( transaction.date ) {
			case 'Heute': transaction.date = new Date(); break;
		};
			
		CashTrack.request('transaction.update', transaction);
		App.back();
	});
	
	$( page ).find('.amount').on('keyup', function() {
		$( this ).removeClass( 'error' );
	});
	
	$( page ).on('appShow', function() {
		var node = $( page ).find('.amount')[0];
		var pos = $( page ).find('.amount').val().length;
			
		if( node.createTextRange ) {
				var range = node.createTextRange();
					range.collapse(true);
					range.moveEnd( pos );
					range.moveStart( pos );
			}else if( node.setSelectionRange ) {
				node.setSelectionRange( pos, pos );
			} else {
				$( page ).find('.amount').focus();
			}
	});
	
	
	var container = $(document.createDocumentFragment());
	var template = $(page).find('.categories .template').removeClass('template').remove();
	_.each( CashTrack.request('categories'), function(category) {
		var item = $(template[0].cloneNode(true));
			item.data('category', category.id );
			item.find('.name').text( category.name );
			item.find('.color').css({'background-color': category.color, 'border-color': darken( category.color, 50) });
			container.append( item );
			
			if( category.default ) {
				item.addClass('selected')
					.find('.radio').attr('checked', 'true');
			}
			
			item.on('click', function(e) {
				$( page ).find('.categories .category.selected').removeClass('selected')
						 .find('.radio').removeAttr('checked');
				$(this).addClass('selected');
				$(this).find('.radio').attr('checked', 'true');
			});
	});
	
	$(page).find('.categories').append( $(container) );
	
}, function(page, args) {

});