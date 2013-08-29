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
	
	CashTrack.entities || ( CashTrack.entities = {} );
	var Category = CashTrack.entities.Category = Backbone.Model.extend({
		defaults: {
          amount: 0.0,
          name: '',
          budget: false,
          color: ''
        },
        initialize: function() {
			this.on('change:transactions', function(model, transactions) {
				this.set('amount', transactions.sum);
			});
		}
	});
	
	var Categories = CashTrack.entities.Categories = Backbone.Collection.extend({
		initialize: function() {
			this.sum = 0.0;
			this.listenTo(this, 'add', function( model ) {
				this.sum += model.get('amount');
			});
            
            this.listenTo(this, 'change:amount', function(model) {
              this.sum -= model.previous('amount');
              this.sum += model.get('amount');
              this.sort();
            });
		},
        comparator: function( model ) {
            return -model.get('amount');
        }
	});
			
	CashTrack.reqres.setHandler('categories', function(month) {
		var deferred = $.Deferred();
		
		$.when( CashTrack.db.ready )
		 .then( function( db ) {
			var transaction = db.transaction( 'categories', 'readonly');
			var categories = transaction.objectStore('categories');
			
			var promises = [];
			var documents = new Categories();
			
			categories.openCursor().onsuccess = function( e ) {
				var cursor = e.target.result;
				if( cursor ) {
					var category = new Category( cursor.value );
					documents.add( category );
					
					if( _.isNumber( month ) ) {
						var d = $.Deferred();
						promises.push( d.promise() );
						
						$.when( CashTrack.request('transactions', category.id, month) )
						 .then( function( transactions ) {
							category.set('transactions', transactions);
							d.resolve( category );
						 });
					}
					
					cursor.continue();
				} else {
					$.when.apply($, promises)
					 .then(function() {
						deferred.resolve( documents );
					 });
				}
			}
		 });
		 
		return deferred.promise();
	});
	
	CashTrack.reqres.setHandler('category', function(id) {
		var d = $.Deferred();
        $.when( CashTrack.db.ready )
         .then( function( db) {
           db.transaction('categories', 'readonly')
             .objectStore('categories')
             .get( id )
             .onsuccess = function() {
               d.resolve( new Category( this.result ) );
             }
         });
        return d.promise();
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
