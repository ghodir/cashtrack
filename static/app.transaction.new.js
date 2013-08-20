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
		var transaction = CashTrack.request('transaction.create', {
			amount: $(page).find('.amount').val(),
			destination: $(page).find('.category.selected').data('category'),
			date: $( page ).find('.date').data('date'),
			notes: $( page ).find('.notes').val(),
		});
		
		transaction.amount = Globalize.parseFloat(transaction.amount);
		if( !transaction.amount ) {
			var node = $( page ).find('.amount').addClass('error')[0];
			var val = $( page ).find('.amount').addClass('error').val();
			$( page ).find('.amount').addClass('error').focus();
		}
		
		if( !transaction.date ) {
			transaction.date = new Date();
			transaction.date.setHours(0, 0, 0, 0);
		}
			
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
	
	$( page ).find('.date').data('date', (new Date()).setHours(0, 0, 0, 0)).val('Heute');
	$( page ).find('.date').pickadate({
		today: 'Heute',
		clear: 'Abbrechen',
		format: Globalize.culture().calendars.standard.patterns.d.toLowerCase(),
		monthsFull: Globalize.culture().calendars.standard.months.names,
		weekdaysShort: Globalize.culture().calendars.standard.days.namesShort,
		container: $( page ),
		onSet: function( e ) {
			var date;
			if( e.hasOwnProperty( 'clear' ) )
				date = $( page ).find('.date').data('date');
			else
				date = new Date( e.select || e.highlight.obj );
				
			var	today = new Date(),
				yesterday = new Date();
			
			date.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0); yesterday.setHours(0, 0, 0, 0);
			yesterday.setDate( yesterday.getDate() - 1 );
			
			if( date.getTime() == today.getTime() )
				$( page ).find('.date').val('Heute');
			else if( date.getTime() == yesterday.getTime() ) {
				$( page ).find('.date').val('Gestern');
			} else {
				$( page ).find('.date').val( Globalize.format( date, 'd'));
			}
			
			$( page ).find('.date').data('date', date);
		},
		onRender: function() {
			var today = new Date();
				today.setHours(0, 0, 0, 0);
			
			var yesterday = new Date();
				yesterday.setHours(0, 0, 0, 0);
				yesterday.setDate( yesterday.getDate() - 1 );
			
			var $clear = this.$root.find('.picker__button--clear');
			var $today = this.$root.find('.picker__button--today');
			var $yesterday = $today.clone();
			
			$clear.after( $yesterday );
			$yesterday.after( $today );
			
			$today.attr('data-pick', today.getTime() ).text('Heute');
			$yesterday.attr('data-pick', yesterday.getTime() ).text('Gestern');
		}
	});
		
}, function(page, args) {

});