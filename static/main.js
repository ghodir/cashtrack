(function() {
	var Category = Backbone.Model.extend({
		defaults: {
			name: '',
			type: '',
			icon: '',
			value: '',
			budget: '',
			color: '',
		}
	});
	
	var CategoriesCollection = Backbone.Collection.extend({
		url: '/api/users/1/categories',
		model: Category,
	});
	
	var Section = Backbone.Model.extend();
	var SectionsCollection = Backbone.Collection.extend();
	
	var View = Backbone.View.extend({
		template: _.template( $('#template-view').html() ),
		initialize: function( options ) {
			options = options || {};
			
			this.collection = options.collection;
			this.collection.on('reset', this.render, this);
		},
		render: function( ) {
			var sections = this.collection.groupBy('type');
			_.each( sections, function( categories, name ) {
				sections[name] = ( new CategoriesCollection(categories)).toJSON()
			});
			this.$el.html( this.template({sections: sections}) );
			return this.$el;
		}
	});
	
	var categories = new CategoriesCollection();
		categories.fetch({
			reset: true,
			success: function() {
				
			},
			error: function(collection, response, options) {
				throw new Error( response );
			}
		});
	
	
	categories.on('reset', function() {
		
	});
	
	var view = new View({
		collection: categories,
	});
	
	
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