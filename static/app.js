var CashTrack = new Marionette.Application();

Marionette.Region.Dialog = Marionette.Region.extend({
	onShow: function( view ) {
		this.listenTo(view, 'dialog:close', this.closeDialog);
	},
	closeDialog: function() {
		this.stopListening();
		this.close();
	}
});

Marionette.ModalView = Marionette.ItemView.extend({
	className: 'modal',
	constructor: function(options) {
		Marionette.ItemView.prototype.constructor.apply(this, arguments);
		this.$el.on('click.delegateEvents' + this.cid, '.close', _.bind(this._onClose, this));
	},
	_onClose: function(e) {
		this.close();
	}
});


CashTrack.addRegions({
	content: '#content-region',
	dialog: Marionette.Region.Dialog.extend({el: '#dialog-region'}),
});

CashTrack.navigate = function(route, options) {
	Backbone.history.navigate(route, options);
}

CashTrack.on('initialize:after', function() {
	if( !Backbone.history )
		return;
	
	Backbone.history.start();
	/*
	if( Backbone.history.fragment === "" )
		CashTrack.trigger('home:show');
	*/
});

(function() {
	/*
	var Node = Backbone.Model.extend({});
	var Nodes = Backbone.Collection.extend({
		url: '/api/users/1/nodes',
		model: Node
	});
	
	var NodeView = Backbone.View.extend({
		className: 'node',
		initialize: function( options ) {
			this.node = options.node;
		},
		render: function() {
			this.template || ( this.template = _.template( $('#template-node').html() ));
			
			this.$el.html( this.template({node: this.node.toJSON()}) );
			return this.$el;
		}
	});
	
	var SectionView = Backbone.View.extend({
		className: 'section',
		initialize: function(options) {
			this.name = options.name;
			this.nodes = [];
			
			this.listenTo( this.nodes, 'add', this.addChildView );
			this.listenTo( this.nodes, 'remove', this.removeChildView );
			this.listenTo( this.nodes, 'reset', this.render );
			
			options.nodes.each(function(node){
				this.nodes.push( new NodeView({node: options.nodes[node]}) );
			});
		},
		render: function() {
			this.template || (this.template = _.template( $('#template-section').html() )),
			
			this.$el.html( this.template({name: this.name}) );
			var $nodes = this.$('.nodes');
			for( node in this.nodes ) {
				$nodes.append( this.nodes[node].render() );
			}
			return this.$el;
		}
	});
	
	var HomeScreen = Backbone.View.extend({
		initialize: function(options) {
			this.sections = {};
			_.each(['income', 'account', 'category', 'goal'], function(name) {
				var c = new SubGroupCollection(options.collection, 'type', name);
				this.sections[name] = new SectionView({name: name, nodes: c});
			}, this);
			
			this.listenTo( options.collection, 'reset', this.render);
			this.listenTo( options.collection, 'change', this.render);
		},
		render: function() {
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
		console.log( nodes.toJSON() );
	});
	
	var view = new HomeScreen({collection: nodes});
	
	
	$(function() {
		$('#content').html( view.render() );
	});
	*/
})();
/*
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
*/