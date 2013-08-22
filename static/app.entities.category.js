(function() {
	var categories = [];
	if( localStorage['categories'] )
		categories = JSON.parse( localStorage['categories'] );
	else {
		categories = [
			{ id: 1, name: 'Andere', color: '#7f8c8d', default: true },
			{ id: 2, name: 'Essen und Trinken', color: '#2ecc71' },
			{ id: 3, name: 'Freizeit',	color: '#2980b9' },
			{ id: 4, name: 'Gesundheit', color: '#c0392b' },
			{ id: 5, name: 'Verkehr & Transport', color: '#f39c12' }
		];
		
		localStorage['category_id'] = 5;
		localStorage['categories'] = JSON.stringify( categories );
	}
	
	var id = localStorage['category_id'] || 0;
	
	CashTrack.on('db:upgrade', function( db ) {
		var objectStore = db.createObjectStore('categories', {keyPath: 'id', autoIncrement: true});
		
		CashTrack.once('db:open', function(db) {
			var transaction = db.transaction(['categories'], 'readwrite');
			var objectStore = transaction.objectStore('categories');
				
			_.each( categories, function(c) {
				if( !c )
					return;
					
				delete c.id;
				
				var request = objectStore.add( c );
					request.onerror = function(e ) {
						CashTrack.trigger('error:db', 'Failed to migrate categories to new database version.');
					}
			});
		});
	});
	
	
	var Category = Application.Model.extend('Category', {

	});
	
	var Categories = Application.Collection.extend('Categories', {
	
	});
			
	CashTrack.reqres.setHandler('categories', function(query, start, end) {
		var deferred = $.Deferred();
		
		if( _.isNumber( start ) ) {
			var months = start;
			start = new Date();
			start.setHours(0, 0, 0, 0);
			start.setMonth( start.getMonth() - months, 1 );
		} else if( _.isDate( start ) ) {
			
		} else {
			start = '';
		}
		
		if( _.isNumber( end ) ) {
			var months = end;
			start = new Date();
			start.setHours(0, 0, 0, 0);
			start.setDate( start.getDate() - end );
		} else if( _.isDate( end ) ) {
			
		} else {
			end	= new Date();
		}
		
		$.when( CashTrack.db.ready )
		 .then( function( db ) {
			var transaction;
			if( start || end ) 
				transaction = db.transaction( ['transactions', 'categories'], 'readonly');
			else
				transaction = db.transaction( 'categories', 'readonly');
			
			var categories = transaction.objectStore('categories');
			
			var sum = 0.0;
			var documents = new Categories();
			categories.openCursor().onsuccess = function( e ) {
				var cursor = e.target.result;
				if( cursor ) {
					var category = new Category( cursor.value );
					
					if( start || end ) {
						var range;
						
						category.amount = 0.0;
						category.transactions = [];
						
						range = IDBKeyRange.only( category.id );
						
						var index = transaction.objectStore('transactions').index('destination');
							index.openCursor( range ).onsuccess = function( event ) {
								var cursor2 = event.target.result;
								if( cursor2 ) {
									var transaction = cursor2.value;
									category.amount += transaction.amount;
									category.transactions.push( transaction);
									cursor2.continue();
								} else {
									sum += category.amount;
									deferred.notify( category );
									documents.push( category );
									cursor.continue();
								}
							}
					} else {
						deferred.notify( category );
						documents.push( category );
						cursor.continue();
					}
				} else {
					if( start || end )
						documents.sum = sum;
					deferred.resolve(documents);
				}
			}
		 });
		 
		return deferred.promise();
		var r = _.isEmpty(query) ? categories : sift(query, categories);
		
		if( !_.isObject( query ) ) {
			end = start;
			start = query;
		};
		
		if( start !== undefined ) {
			if( _.isNumber( start ) ) {
				var now = new Date(), y = now.getFullYear(), m = now.getMonth() - start;
					start = new Date(y, m, 1);
					end   = new Date(y, m + 1, 1);
			}
			
			r.sum = 0.00;
			_.each( r, function( category ) {
				category.transactions = CashTrack.request('transactions', { 
					destination: category.id,
					date: { $gte: start, $lt: end } 
				});
				
				category.amount = 0.00;
				_.each(category.transactions, function( t ) {
					category.amount += t.amount;
				});
				
				r.sum += category.amount;
			});
		}
		
		return r;
	});
	
	CashTrack.reqres.setHandler('category', function(id) {
		return _.find( categories, function( category ) {
			return category.id == id;
		});
	});
	
	CashTrack.reqres.setHandler('category.create', function( data ) {
		return new Category( data );
	});
	
	CashTrack.reqres.setHandler('category.update', function( category ) {
		if( !category.id ) {
			category.id = ++id;
			localStorage['category_id'] = id;
		}
		
		categories.push( category );
		localStorage['categories'] = JSON.stringify( categories );
	});
	
	CashTrack.reqres.setHandler('categorie.remove', function( category ) {
		var index = categories.indexOf( category );
		if( ~index ) {
			delete categories[ index ];
			localStorage['categories'] = JSON.stringify( categories );
		}
	});
	
})(CashTrack);
