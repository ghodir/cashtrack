App.populator('transaction', function(page, args) {	
	var AmountInputView = Backbone.Marionette.ItemView.extend({
		el: $( page ).find('.amount')[0],
		events: {
			'focus .value': 'onFocus',
			'keyup .value': 'onKeyup',
			'keydown .value': 'onKeydown',
			'keypress .value': 'onKeypress',
			'mousedown .value': 'onMousedown',
		},
		initialize: function( options ) {
			this.input = this.$el.find('.value');
			this.value( this.model.get('amount') );
			
			this.input.focus();
		},
		value: function( value ) {
			if( value !== undefined )
				return this.input.val( Globalize.format( value, 'n2') );
			else
				return Globalize.parseFloat( this.input.val() );
		},
		render: function() { return this; },
		onFocus: function() {
			this.input[0].selectionStart = this.input[0].selectionEnd = this.input[0].value.length;
		},
		onKeyup: function() {
			this.model.set('amount', this.value() );
		},
		onKeydown: function(e) {
			if( e.which == 8 )
				this.value( this.value() * 0.1);
			else if( (48 <= e.which && e.which <= 58) || ( 96 <= e.which && e.which <= 106) )
				return;
			
			e.preventDefault();
		},
		onKeypress: function( e ) {
			e = e || window.event;
			var char = String.fromCharCode( e.which || e.keyCode );
			this.value( this.value() * 10 + parseInt( char ) * 0.01 );
			e.preventDefault();
		},
		onMousedown: function( e ) {
			this.input.focus();
			e.preventDefault();
		}
	});
	
	var CategoryView = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		className: 'category',
		template: '#transaction-category-template',
		events: {
			'click': 'onClick',
		},
		onRender: function() {
			this.$el.data('category', this.model.get('id') );
			
			if( this.model.get('default') )
				this.$el.addClass('selected');
		},
		onClick: function() {
			this.select();
		},
		select: function() {
			this.$el.siblings().removeClass('selected');
			this.$el.addClass('selected');
			this.trigger('selected', this.model );
		}
	});
	
	var CategoryListView = Backbone.Marionette.CollectionView.extend({
		tagName: 'ul',
		className: 'categories app-list',
		itemView: CategoryView,
		itemViewEventPrefix: 'item',
		initialize: function( options ) {
			this.model = options.model;
			
			this.listenTo(this, 'item:selected', function( view, item ) {
				this.model.set('destination', item.get('id') );
			});			
		},
		onRender: function() {
			var model = this.collection.get( this.model.get('destination') );
			if( model )
				this.children.findByModel( model ).select();
		}
	});
	
	var DatePickerView = Backbone.Marionette.ItemView.extend({
		el: $( page ).find('.date')[0],
		initialize: function() {
			this.input = this.$el.find('.value');
			
			this.$el.pickadate({
				today: 'Heute',
				clear: 'Abbrechen',
				format: Globalize.culture().calendars.standard.patterns.d.toLowerCase(),
				monthsFull: Globalize.culture().calendars.standard.months.names,
				weekdaysShort: Globalize.culture().calendars.standard.days.namesShort,
				container: $( page ),
				onSet: _.bind(this.onSet, this),
				onRender: this.onRender,
			});
			
			this.$el.pickadate('picker').set('select', this.model.get('date') );
		},
		onSet: function( e ) {
			var date;
			if( e instanceof Date )
				date = e;
			else if( e.hasOwnProperty( 'clear' ) )
				date = this.model.get('date');
			else
				date = new Date( e.select || e.highlight.obj );
				
			var	today = new Date(),
				yesterday = new Date();
			
			date.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0); yesterday.setHours(0, 0, 0, 0);
			yesterday.setDate( yesterday.getDate() - 1 );
			
			if( date.getTime() == today.getTime() )
				this.input.val('Heute');
			else if( date.getTime() == yesterday.getTime() ) {
				this.input.val('Gestern');
			} else {
				this.input.val( Globalize.format( date, 'd'));
			}
			
			this.model.set('date',date);
		},
		onRender: function() {
			var today = new Date();
				today.setHours(0, 0, 0, 0);
			
			var yesterday = new Date();
				yesterday.setHours(0, 0, 0, 0);
				yesterday.setDate( yesterday.getDate() - 1 );
			
			var $clear = this.$root.find('.picker__button--clear');
			var $today = this.$root.find('.picker__button--today');
			var $yesterday = $today.clone();
			
			$clear.after( $yesterday );
			$yesterday.after( $today );
			
			$today.attr('data-pick', today.getTime() ).text('Heute');
			$yesterday.attr('data-pick', yesterday.getTime() ).text('Gestern');
		}
	});
	
	var TextInputView = Backbone.Marionette.ItemView.extend({
		events: {
			'change .value': 'onChange',
		},
		initialize: function( options ) {
			this.input = this.$el.find('.value');
			this.field = options.field;
			this.input.val( this.model.get(this.field) );
		},
		onChange: function() {
			this.model.set( this.field, this.input.val() );
		}
	});
	
	var TransactionForm = Backbone.Marionette.Layout.extend({
		el: function() { return $('#transaction')[0] },
		events: {
			'click .back': 'onAbort',
			'click .save': 'onSave',
			'click .delete': 'onDelete',
		},
		regions: {
			amount: '.app-section:nth-child(1)',
			categories: '.app-section:nth-child(2)',
			meta: '.app-section:nth-child(3)',
		},
		initialize: function() {
			if( !this.model.get('id') )
				this.$el.find('.delete').parent().hide();
		},
		render: function() {
			return this;
		},
		save: function() {
			var amount = this.regions.amount.currentView.value();
			var category = this.regions.a
		},
		onAbort: function() {
			App.back();
		},
		onSave: function() {
			this.save();
		},
		onDelete: function() {
			this.delete();
		},
		save: function() {
			CashTrack.request('transaction.save', this.model);
			App.back();
		},
		delete: function() {
			CashTrack.request('transaction.delete', this.model);
			App.back();
		}
	});
	
	$( page ).on('appShow', function() {
	
		var transaction;
		if( args.id )
			transaction = CashTrack.request('transaction', args.id);
		else
			transaction = CashTrack.request('transaction.create');
		
		var categories = CashTrack.request('categories');
		$( page ).find('.app-content').hide();
		$.when( transaction, categories )
		 .then( function( transaction, categories ) {
			
			if( !transaction.get('date') )
				transaction.set('date', new Date());
			
			var layout = new TransactionForm({model: transaction});
			layout.amount.attachView( new AmountInputView({ model: transaction}) );
			
			layout.categories.show( new CategoryListView({ model: transaction, collection: categories }) );	
			
			layout.meta.date = new DatePickerView({ model: transaction });
			layout.meta.note = new TextInputView({ el: $( page ).find('.note'), model: transaction, field: 'note' });
			
			$( page ).find('.app-content').show();
		 });
	});
}, function(page, args) {
	//Delete page.layout
});