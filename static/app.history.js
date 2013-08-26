App.populator('history', function(page, args) {
	var TransactionView = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		className: 'transaction',
		template: '#history-transaction-template',
		events: {
			'click': 'onClick',
		},
        serializeData: function() {
          var data = Backbone.Marionette.CompositeView.prototype.serializeData.call(this);
              data.categories = {};
              this.categories.forEach( function(model) {
                data.categories[ model.get('id') ] = model.toJSON();
              });
          return data;
        },
		initialize: function( options ) {
			this.categories = options.categories;
		},
		onClick: function() {
			App.load('transaction', {id: this.model.get('id') } );
		}
	});

	var MonthView = Backbone.Marionette.CompositeView.extend({
		tagName: 'li',
		className: 'app-section month',
		template: '#history-month-template',
        itemView: TransactionView,
        itemViewContainer: '.transactions',
        itemViewOptions: function() { return { categories: this.categories};},
		events: {
			'click .header': 'toggle',
		},
		initialize: function( options ) {
			this.categories = options.categories;
		},
        serializeData: function() {
          var data = Backbone.Marionette.CompositeView.prototype.serializeData.call(this);
              data.categories = this.categories.toJSON();
          return data;
        },
        onRender: function() {
          if( this.collection.length == 0 )
            this.$el.addClass('empty');  
          else
            this.$el.addClass('expanded');
        },
		toggle: function() {
			if( this.$el.hasClass('empty') )
				return;
				
			if( this.$el.hasClass('expanded') )
				this.fold();
			else
				this.expand();
		},
		expand: function() {
			this.$el.addClass('expanded').removeClass('folded');
			this.$el.find('.transactions').css('height', this.$el.data('height') + 'px' );
		}, 
		fold: function() {
			this.$el.data('height', this.$el.find('.transactions').height());
			this.$el.removeClass('expanded').addClass('folded');
			this.$el.find('.transactions').css('height', '0px');
		}
	});
    
    var HistoryView = Backbone.Marionette.CollectionView.extend({
      tagName: 'ul',
      className: 'months',
      itemView: MonthView,
      itemViewOptions: function(model, index){ 
        return {
          month: model.get('month'),
          categories: this.categories,
          collection: model.get('transactions'),
        }; 
      },
      initialize: function( options ) {
        this.categories = options.categories;
        this.collection = new Backbone.Collection();
        
        var now = new Date();
        var groups = options.collection.groupBy(function( transaction ) {
          return ( new Date(now - transaction.get('date')) ).getMonth();
        });
        
        var months = _.keys( groups ).sort();
        for( var month = months[0]; month <= months[ months.length - 1]; month++) {
          var transactions = new CashTrack.entities.Transactions( groups[month] || []);
          var model = new Backbone.Model();
              model.set('month', month);
              model.set('amount', transactions.sum);
              model.set('transactions',  transactions);
          this.collection.push( model );
        }
      }
    });
    
    var Layout = Backbone.Marionette.Layout.extend({
      el: $( page )[0],
      regions: {
        history: '.history-region',
      },
      events: {
        'change .category .value': 'onCategoryChange',
      },
      initialize: function( options ) {
        
        var select = this.$el.find('.category .value').empty();
            select.append( $('<option>').attr('value', '').text( 'Alle' ) )
        options.categories.forEach( function( category ) {
			$('<option>').attr('value', category.get('id')).text( category.get('name') ).appendTo( select );
		});
        this.categories = options.categories;
      },
      render: function() { return this; },
      onCategoryChange: function( e ) {
        var category = e.target.value;
        
        this.showCategory( category );
      },
      showCategory: function( category ) {
        var self = this;
        
        $.when( CashTrack.request('transactions', category) )
		 .then( function(transactions) {
           self.history.show( new HistoryView({ categories: self.categories, collection: transactions}) );
		 });
        
        
        this.$el.find('.category .value option')
                .removeAttr('selected')
                .filter('[value="' + category + '"]')
                .attr('selected', 'true');
      }
    });
	
	$( page ).on('appShow', function() {
		
		CashTrack.request('categories').then(function(categories) {
          var layout = new Layout({ categories: categories });
              layout.showCategory(null);
        });
	});
});