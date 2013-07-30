CashTrack.module('Entities', function(Entities, CashTrack, Backbone, Marionette, $, _) {
	Entities.SubCollection = Backbone.Collection.extend({
		constructor: function( collection, cb, options ) {
			this.collection = collection;
			cb && (this.cb = cb);
			
			this.listenTo( this.collection, 'add', this._onAdd);
			this.listenTo( this.collection, 'change', this._onChange);
			this.listenTo( this.collection, 'remove', this._onRemove);
			this.listenTo( this.collection, 'reset', this._onReset);

			var models = this.collection.filter(cb);
			Backbone.Collection.call(this, models, options);
		},
		_onChange: function(model) {
			if( !this.cb(model) )
				this.remove( model );
		},
		_onAdd: function(model) {
			if( this.cb(model) )
				this.add( model );
		},
		_onRemove: function(model) {
			this.remove(model);
		},
		_onReset: function() {
			this.reset( this.collection.filter(this.cb) );
		}
	});

	Entities.SubGroupCollection = Entities.SubCollection.extend({
		constructor: function(collection, name, value, options) {
			SubCollection.call(this, collection, function(model) {
				return model.get(name) === value;
			}, options);
		}
	});

	Entities.SubTypeCollection = Entities.SubCollection.extend({
		constructor: function(collection, value, options) {
			SubCollection.call(this, collection, function(model) {
				return model.get('type') === 'value';
			}, options);
		}
	});
});