(function() {	
	var transactions = [];
	if( localStorage['transactions'] ) {
		transactions = JSON.parse( localStorage['transactions'] );
		_.map(transactions, function( t ) {
			if( !t )
				return;
				
			t.date = new Date( t.date );
			return t;
		});
	}
	
	var id = localStorage['transactions_id'] || 0;
	
	
	CashTrack.on('db:upgrade', function( db ) {
		var objectStore = db.createObjectStore('transactions', {keyPath: 'id', autoIncrement: true});
			objectStore.createIndex('date', 'date', {unique: false});
			objectStore.createIndex('destination', 'destination', {unique: false});
			objectStore.createIndex('destination-date', ['destination', 'date'], {unique: false});
		
		CashTrack.once('db:open', function() {
			var transaction = db.transaction(['transactions'], 'readwrite');
			var objectStore = transaction.objectStore('transactions');
			_.each( transactions, function(t) {
				if( !t )
					return;
					
				delete t.id;
				t.destination = parseInt( t.destination );
				
				var request = objectStore.add( t );
					request.onerror = function(e ) {
						CashTrack.trigger('error:db', 'Failed to migrate transactions to new database version.');
					}
			});
		});
		
	});
	
	var Transaction = Backbone.Model.extend({});
	var Transactions = Backbone.Collection.extend({
		initialize: function() {
			this.sum = 0.0;
			this.on('add', function( model ) {
				this.sum += model.get('amount');
			});
		}
	});
	
	// Query by months in the past, destination, time range
	CashTrack.reqres.setHandler('transactions', function( category, month ) {
		var d = $.Deferred(), start, end;
		
		category || ( category = '');
		
		if( _.isNumber( month ) ) {
			now = new Date(), y = now.getFullYear(), m = now.getMonth() - month;
			start = new Date(y, m, 1);
			end = new Date(y, m + 1, 1);
		}
			
		$.when( CashTrack.db.ready )
		 .then( function( db ) {
			var transaction = db.transaction('transactions', 'readonly' );
			
			var documents = new Transactions();
			var range = IDBKeyRange.bound( [category, start], [category, end] );
			var index = transaction.objectStore('transactions').index('destination-date');
				index.openCursor( range ).onsuccess = function( event ) {
					var cursor = event.target.result;
					if( cursor ) {
						var transaction = new Transaction( cursor.value );
						documents.push( transaction );
						cursor.continue();
					} else {
						d.resolve( documents );
					}
				}
		 });
		return d.promise();
	});
	
	CashTrack.reqres.setHandler('transaction', function(id) {
		return _.find( transactions, function( transaction ) {
			return transaction.id == id;
		});
	});
	
	CashTrack.reqres.setHandler('transaction.create', function( data ) {
		return new Transaction( data );
	});
	
	CashTrack.reqres.setHandler('transaction.save', function( transaction ) {
		if( !transaction.id ) {
			transaction.id = ++id;
			localStorage['transactions_id'] = id;
		}
		
		transactions.push( transaction );
		localStorage['transactions'] = JSON.stringify( transactions );
	});
	CashTrack.reqres.setHandler('transaction.remove', function( transaction ) {
	
		var index = transactions.indexOf( transaction );
		if( ~index ) {
			delete transactions[ index ];
			localStorage['transactions'] = JSON.stringify( transactions );
		}
	});

})(CashTrack);