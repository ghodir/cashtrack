(function() {
	"use strict";
	
	var colors = [ '#1ABC9C','#16A085','#2ECC71','#27AE60','#3498DB','#2980B9','#9B59B6','#8E44AD','#34495E	','#2C3E50','#F1C40F','#F39C12','#E67E22','#D35400','#E74C3C','#C0392B','#ECF0F1','#BDC3C7','#95A5A6','#7F8C8D'];
	function hexToRgb(hex) {
		var bigint = parseInt(hex.slice(1), 16);
		var r = (bigint >> 16) & 255;
		var g = (bigint >> 8) & 255;
		var b = bigint & 255;

		return r + "," + g + "," + b;
	}
	
	Globalize.culture('de');
	
	var categories = [];
	if( localStorage['categories'] )
		categories = JSON.parse( localStorage['categories'] );
	else 
		categories = [
			{ id: 1, name: 'Andere', color: '#7f8c8d', default: true },
			{ id: 2, name: 'Essen und Trinken', color: '#2ecc71' },
			{ id: 3, name: 'Freizeit',	color: '#2980b9' },
			{ id: 4, name: 'Gesundheit', color: '#c0392b' },
			{ id: 5, name: 'Verkehr & Transport', color: '#f39c12' }
		];
	
	var transactions;
	if( localStorage['transactions'] )
		transactions = JSON.parse( localStorage['transactions'] );
	else 
		transactions = [];
		
	function getCategoryById( id ) {
		return _.find( categories, function( category ) {
			return category.id == id;
		});
	}
	
	$( window ).on('unload', function() {
		localStorage['categories'] = JSON.stringify( categories );
		localStorage['transactions'] = JSON.stringify( transactions );
	});
	
	App.populator('overview', function(page, args) {
		var template = $(page).find('.categories .template').removeClass('template').remove();
		
		$( page ).on('appShow', function() {
			$(page).find('.categories').empty()
			
			var start = new Date();
			start.setDate(1);
			start.setHours(0, 0, 0, 0);
			var end = new Date();
				end.setMonth( start.getMonth() + 1 );
				end.setDate(1);
				end.setHours(0, 0, 0, 0);
			
			var sum = 0.00;
			var amounts = {};
			_.each( transactions, function( transaction ) {
				var date = new Date(transaction.date);
				if( start <= date && date <= end ) {
					sum += transaction.amount;
					if( amounts[ transaction.destination ] )
						amounts[ transaction.destination ] += transaction.amount;
					else
						amounts[ transaction.destination ] = transaction.amount;
				}
			});
			
			var max = 0.0;
			var percentages = {};
			_.each( categories, function( category ) {
				percentages[ category.id ] = amounts[ category.id ] / sum;
				if( percentages[ category.id ] > max )
					max = percentages[ category.id ];
			});
			
			$( page ).find('.month').text( Globalize.format( start, 'MMMM') );
			$( page ).find('.expenses').text( Globalize.format( sum, 'c' ) );
			
			var container = $(document.createDocumentFragment());
			for( var index in categories ) {
				var category = categories[index];
				var item = $(template[0].cloneNode(true));
					item.data('category', category.id );
					item.addClass(category.color);
					item.find('.name').text( category.name );
					item.find('.amount').text( Globalize.format( amounts[ category.id ], 'c' ) );
					
					item.find('.bar').css('background-color', category.color);
					item.find('.bar').anim({width: percentages[ category.id ] / max * 100.0 + '%'}, .4, 'ease-out');
					
					container.append( item );
			}
			
			$(page).find('.categories').append( $(container) );
		});
		
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
	
	
	App.populator('history', function(page, args) {
		$( page ).on('appShow', function() {
			
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
				
				var trans = _.filter( transactions, function( t ) {
					return !category || t.destination == category;
				});
				
				var min = new Date( _.min( trans, function( transaction ) { return new Date( transaction.date); }).date );
					min.setDate(1)
					min.setHours(0, 0, 0, 0);
				
				if( start < min )
					return false;
				
				var $container = $('<ul>').addClass('app-list transactions');
				var $section = $('<li>').addClass('app-section month');
				
				var sum = 0.0;
				_.each( trans, function( transaction ) {
					var date = new Date(transaction.date);
					if( !(start <= date && date <= end) )
						return;
					
					sum += transaction.amount;
					
					var c = getCategoryById( transaction.destination );
					
					var $item = $('<li>').addClass('transaction');
						$item.append( $('<span>').addClass('date').text( Globalize.format( new Date(transaction.date), 'ddd, d.') ) );
						$item.append( $('<span>').addClass('color').css('background-color', c.color) );
						$item.append( $('<span>').addClass('name').text( c.name ) );
						$item.append( $('<span>').addClass('amount').text( Globalize.format( transaction.amount, 'c' ) ) );
						
						$item.appendTo( $container );
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
					//debugger;
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
})();