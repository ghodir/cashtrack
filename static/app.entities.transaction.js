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
	
	CashTrack.entities || ( CashTrack.entities = {} );
	var Transaction = CashTrack.entities.Transaction = Backbone.Model.extend({});
	var Transactions = CashTrack.entities.Transactions = Backbone.Collection.extend({
		initialize: function( models, options ) {
			this.sum = 0.0;
			_.each( models, function(model) {
				this.sum += model.get('amount');
			}, this);
			this.on('add', function( model ) {
				this.sum += model.get('amount');
			}, this);
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
		} else {
			start = end = '';
		}
			
		$.when( CashTrack.db.ready )
		 .then( function( db ) {
			var transaction = db.transaction('transactions', 'readonly' );
			
			var range;
			var index;
			var store = transaction.objectStore('transactions');
			
			if( category && start && end ) {
				index = store.index('destination-date');
				range = IDBKeyRange.bound( [category, start], [category, end], false, true );
			} else if( category && !start ) {
				index = store.index('destination');
				range = IDBKeyRange.only( category );
			} else if( !category && start ) {
				index = store.index('date');
				range = IDBKeyRange.bound( start, end, false, true );
			} else {
				index = store;
				range = null;
			}
			
			// Get all transactions - newest first
			var documents = new Transactions();
			index.openCursor( range, 'prev' ).onsuccess = function( event ) {
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