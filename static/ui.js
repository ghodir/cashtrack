(function() {
	var array = [],
		push  = array.push,
		slice = array.slice,
		splice = array.splice;
		
	var UI;
	if( typeof exports !== 'undefined' ) {
		UI = exports;
	} else {
		UI = this.UI = {};
	}
	
	UI.VERSION = '0.0.1';
	
	var View = UI.View = Marionette.View.extend({
		construct: function( options ) {
			options = arguments[ arguments.length - 1 ] || {};
			
			_.bindAll(this, "render");
			
			this.cid = _.uniqueId('view');
			this._configure(options);
			this._ensureElement();
			this.initialize.apply(this, arguments);
			this.delegateEvents();
			
			Marionette.MonitorDOMRefresh( this );
			this.listenTo(this, 'show', this.onShowCalled, this);
		}
	});
	
	var Button = UI.Button = Backbone.View.extend({
		tagName: 'button',
		initialize: function(text, options) {
			this.text = text;
		},
		render: function() {
			this.$el.text( this.text )
		}
		
	});
})();

return;

var Modal = Marionette.View.extend({
	construct: function() {
		var titlebar = $('<div>').addClass('titlebar').appendTo( this.$el );
		this.title = $('<h3>').addClass('title').appendTo( titlebar );
		this.close = $('<button>').addClass('close').appendTo( titlebar );
		
		var buttons = _.result(this, 'buttons');
			this.buttons = new UI.CollectionView();
			buttons.each(function(properties, name) {
				this.buttons.append(name, new UI.Button( properties ));
			});
			this.$el.append(this.buttons);
			
		Marionette.View.prototype.construct.apply(this, arguments);
		
		this.close.on('click', _.bind(function( e ) {
			if( !this.triggerMethod('close') )
				return;
			
			
		}, this);
	},
	setTitle: function( title ) {
		this.title.text( title );
	}
});

var TransactionViewModal = Modal.extend({
	buttons: {
		today: {
			type: 'primary',
			text: 'Heute',
			events: {
				'click': function() {					
					this.createTransaction('today');
				}
			}
		},
		yesterday: {
			type: 'secondary',
			text: 'Gestern',
			events: {
				'click': function() {					
					this.createTransaction('yesterday');
				}
			}
		},
	},
	initialize: function(source, destination) {
		this.title = 'Test';
	},
	createTransaction: function( date ) {
		switch( date ) {
			case 'today': date = new Date(); break;
			case 'yesterday': (date = new Date()).setDate( date.getDate() - 1); break;
		}
		
		console.log( date );
	}
});

var modal = new TransactionViewModal();

app.showModal( modal );