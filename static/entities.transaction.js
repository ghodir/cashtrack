CashTrack.module('Entities', function(Entities, CashTrack, Backbone, Marionette, $, _) {
	
	Entities.Transaction = Backbone.Model.extend({
		url: '/api/users/1/transactions',
		validate: function(attrs, options) {
			var errors = {};
			
			if( !attrs.value )
				errors.value = 'Value must not be empty.';
			else {
				attrs.value = parseFloat( attrs.value );
				
				if( isNaN(attrs.value) )
					errors.value = 'Value has to be a number.';
			}
			
			return Object.keys(errors).length ? errors : undefined;
		}
	});
	
	Entities.TransactionCollection = Backbone.Collection.extend({
		model: Entities.Transaction,
		url: '/api/users/1/transactions'
	});
	
	CashTrack.reqres.setHandler('transaction', function(id) {
		var defer = $.Deferred();
		var transactions  = new Entities.Transaction({id: id});
		    transactions.fetch({
				success: function(data) {
					defer.resolve(data);
				},
				error: function() {
					CashTrack.trigger('error');
				}
			});
			
		return defer.promise();
	});
	
	CashTrack.reqres.setHandler('transactions', function() {
		var defer = $.Deferred();
		var transactions = new Entities.TransactionCollection();
		    transactions.fetch({
				success: function( data ) {
					defer.resolve(data);
				},
				error: function() {
					CashTrack.trigger('error');
				}
			});
		return defer.promise();
	});
});