(function() {
	"use strict";
	
	var categories = [];
	if( localStorage['categories'] )
		categories = JSON.parse( localStorage['categories'] );
	else 
		categories = [
			{ id: 1, name: 'Andere', color: 'gray', default: true },
			{ id: 2, name: 'Essen und Trinken', color: 'green' },
			{ id: 3, name: 'Freizeit',	color: 'blue' },
			{ id: 4, name: 'Gesundheit', color: 'red' },
			{ id: 5, name: 'Verkehr & Transport', color: 'orange' }
		];
	
	var transactions;
	if( localStorage['transactions'] )
		transactions = JSON.parse( localStorage['transactions'] );
	else 
		transactions = [];
	
	$( window ).on('unload', function() {
		localStorage['categories'] = JSON.stringify( categories );
		localStorage['transactions'] = JSON.stringify( transactions );
	});
	
	App.populator('overview', function(page, args) {
	
	}, function(page, args) {
	
	});
	
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
			var transaction = {};
				transaction.amount = $(page).find('.amount').val();
				transaction.destination = $(page).find('.category.selected').data('category');
				transaction.date = $( page ).find('.date').val();
				transaction.notes = $( page ).find('.notes').val();
			
			transaction.amount = parseFloat(transaction.amount);
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
				
			transactions.push( transaction );
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
		for( var index in categories ) {
			var category = categories[index];
			var item = $(template[0].cloneNode(true));
				item.data('category', category.id );
				item.find('.name').text( category.name );
				item.find('.color').css('background-color', category.color );
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
		}
		
		$(page).find('.categories').append( $(container) );
		
	}, function(page, args) {
	
	});
})();