(function() {
	var Transaction = function( data ) {
		_.extend(this, data);
	};

	var transactions = [];
	if( localStorage['transactions'] ) {
		transactions = JSON.parse( localStorage['transactions'] );
		_.map(transactions, function( t ) {
			t.date = new Date( t.date );
			return t;
		});
	}
	
	var id = localStorage['transactions_id'] || 0;
	
	CashTrack.reqres.setHandler('transactions', function( query ) {
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