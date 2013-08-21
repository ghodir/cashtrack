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
	
	var db = $.Deferred();
		db.ready = db.promise();
	var request = window.indexedDB.open('cashtrack', 1);
		request.onerror = function( event ) {
			console.log( event.target.errorCode );
		}
		request.onsuccess = function( event ) {
			db.resolve( event.target.result );
			
			var transaction = db.transaction(['transactions'], 'readwrite');
			var objectStore = transaction.objectStore('transactions');
			/*
			_.each( transactions, function(t) {
				if( !t )
					return;
					
				delete t.id;
				
				var request = objectStore.add( t );
					request.onsuccess = function(e) {
						console.log( e.target.result );
					}
					request.onerror = function(e ) {
						console.log( e );
					}
			});
			*/
		}
		request.onupgradeneeded = function( event ) {
			db = event.target.result;
			
			var objectStore = db.createObjectStore('transactions', {keyPath: 'id', autoIncrement: true});
				objectStore.createIndex('date', 'date', {unique: false});
		}

	CashTrack.reqres.setHandler('transactions', function( query ) {
		$.when( db.ready )
		 .then( function() {
			var transaction = db.transaction(['transactions'], 'read');
			var objectStore = transaction.objectStore('transactions');
			
		 })
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