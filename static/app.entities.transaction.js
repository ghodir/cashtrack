(function() {
	var Transaction = function( data ) {
		_.extend(this, data);
	};
	
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
	
	// Query by months in the past, destination, time range
	CashTrack.reqres.setHandler('transactions', function( query ) {
		var d = $.Deferred();
		
		$.when( CashTrack.db.ready )
		 .then( function( db ) {
			var store = db.transaction(
								['transactions'],
								'readonly'
							)
							.objectStore('transactions');
			
			var documents = [];
			store.openCursor().onsuccess = function( e ) {
				var cursor = e.target.result;
				if( cursor ) {
					documents.push( cursor.value );
					cursor.continue();
				} else {
					d.resolve(documents);
				}
			}
			
		 });
		 
		return d.promise();
		return !query ? transactions : sift(query, transactions);
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