(function() {
	var SubCollection = Backbone.Collection.extend({
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
	
	var SubGroupCollection = SubCollection.extend({
		constructor: function(collection, name, value, options) {
			SubCollection.call(this, collection, function(model) {
				return model.get(name) === value;
			}, options);
		}
	});
	
	var Node = Backbone.Model.extend({});
	var Nodes = Backbone.Collection.extend({
		url: '/api/users/1/nodes',
		model: Node
	});
	
	var SectionView = Backbone.View.extend({
		className: 'section',
		initialize: function(options) {
			this.name = options.name;
			this.elements = options.elements;
		},
		render: function() {
			this.template || (this.template = _.template( $('#template-section').html() )),
			
			console.log( 'render section' );
			this.$el.html( this.template({name: this.name, elements: this.elements.toJSON() }) );
			return this.$el;
		}
	});
	
	var HomeScreen = Backbone.View.extend({
		initialize: function(options) {
			this.sections = {};
			_.each(['income', 'account', 'category', 'goal'], function(name) {
				var c = new SubGroupCollection(options.collection, 'type', name);
				this.sections[name] = new SectionView({name: name, elements: c});
			}, this);
			
			this.listenTo( options.collection, 'reset', this.render);
			this.listenTo( options.collection, 'change', this.render);
		},
		render: function() {
			console.log( 'render home screen' );
			this.$el.html('');
			for( name in this.sections ) {
				this.$el.append( this.sections[name].render() );
			}
			return this.$el;
		}
	});
	
	var nodes = new Nodes();
		nodes.fetch({
			reset: true,
			success: function() {
				
			},
			error: function(collection, response, options) {
				throw new Error( response );
			}
		});
		
	nodes.on('reset', function() {
		console.log('reset', nodes.toJSON());
		
	});
	
	var view = new HomeScreen({collection: nodes});
	
	
	$(function() {
		$('#content').html( view.render() );
	});
})();

$(function() {
	$('.category.source').draggable({
		stack: '.category',
		revert: 'invalid',
		helper: function() {
			var icon = $( this ).find('.icon');
			var offset = icon.offset();
				offset.left += icon.width() * 0.5;
				offset.top  += icon.height() * 0.5;
				
			var helper = $('<div>')
						.addClass( 'icon icon-coin' )
						.addClass( 'draggable' )
						.css('background-color', icon.parent().css('background-color') );
		
			console.log($(this).width() , helper.width())
			helper.css( 'margin-left', ($(this).width() - 25 )  * .5 );
			helper.css( 'margin-top',  ($(this).height() - 25 ) * .5 );
			
			return helper;
		},
		start: function(event, ui) {
			$('body').addClass('dragging');
			
			console.log(ui.helper.width());
			$(this).draggable('option', 'cursorAt', {
				left: ui.helper.width() * .5,
				top: ui.helper.height() * .5
			});
		},
		stop: function() {
			$('body').removeClass('dragging');
		}
	});
	
	$('.category.destination').droppable({
		over: function(event, ui) {
			$( this ).addClass('hover');
		},
		out: function(event, ui) {
			$( this ).removeClass('hover');
		}
	});
	
	$('.category').click(function() {
		console.log('click');
	});
});