App.populator('distribution', function(page, args) {
    var ChartView = Backbone.Marionette.View.extend({
        className: 'chart',
        initialize: function( options ) {
          this.collection = options.collection;
          this.paper = new Raphael( this.el );
        },
        render: function() {
          this.triggerMethod('render', this);
          return this;
        },
        onDomRefresh: function() {
          var width = this.$el.width(),
              height = this.$el.height();
              
          this.paper.setSize( width, height );
          
          if( this.collection.sum ) {
            var items = [];
            this.collection.each( function( category ) {
              if( category.get('amount') )
                  items.push([category.get('amount'), category.get('name'), category.get('color')]);
            });
              
            this.paper.drawPieChart( width * 0.5, height * 0.5, Math.min( width, height ) * 0.5, items);
          } else {
              this.paper.text( width * 0.5, height * 0.5, 'Keine Daten')
                        .attr({'font-family': 'Roboto', 'font-size': '42px', 'font-weight': '200'});
          }
        }
    });
    
    var CategoryView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'category',
        template: '#distribution-category-template',
    });
    
    var CategoriesView = Backbone.Marionette.CollectionView.extend({
      tagName: 'ul',
      className: 'app-list categories',
	  itemView: CategoryView,
      initialize: function() {
          this.collection.each( function( category){
              category.set('percentage', category.get('amount') / this.collection.sum);
          }, this);
      }
    });
    
    var DistributionLayout = Backbone.Marionette.Layout.extend({
      el: page,
      regions: {
        chart: '.chart-region',
        content: '.categories-region',
      },
      events: {
        'change .years': 'onChange',
        'change .months': 'onChange',
      },
      initialize: function( options ) {            
        var months = this.$el.find('.months');
        for(var i = 0; i < 12; i++)
			var option = $('<option>').attr('value', i).text( Globalize.culture().calendars.standard.months.names[i] ).appendTo( months );
        
        var self = this;
        $.when( CashTrack.request('transactions', {count: 1}) )
         .then( function(transactions) {
             if( !transactions.length )
               return;
             
             var years = self.$el.find('.years');
             var min = transactions.models[0].get('date').getFullYear(),
                 max = (new Date()).getFullYear();
             while( max >= min++ )
               var option = $('<option>').attr('value', min - 1).text( min - 1 ).appendTo( years );
         });
         
         var now = new Date(),
             then = new Date( now.getFullYear(), now.getMonth() - (options.month || 0), 1);
             
         this.setMonth( then.getFullYear(), then.getMonth() );
      },
      onChange: function() {
        var year = this.$el.find('.years').val();
        var month = this.$el.find('.months').val();
        
        this.setMonth( parseInt(year), parseInt(month) );
      },
      setMonth: function( year, month ) {
          var now = new Date();
          if( month === undefined ) {
              var then = new Date( now.getFullYear(), now.getMonth() - year, 1);
              year = then.getFullYear();
              month = then.getMonth();
          }
          
          var $options = this.$el.find('.months option');
              $options.removeAttr('selected');
              $options.eq( month ).attr('selected', 'true');
              
              $options = this.$el.find('.years option');
              $options.removeAttr('selected');
              $options.filter('[value="' + year + '"]').attr('selected', 'true');
              
          this.trigger('month:change', now.getMonth() - month + 12 * ( now.getFullYear() - year ) );
      }
    });
    
	$(page).on('appShow', function() {
        
        // Change this 'cause it's ugly
        var layout = new DistributionLayout({month: 0});
        layout.on('month:change', function( month ) {
            CashTrack.request('categories', month).then( function( categories ) {
                  layout.chart.show( new ChartView({collection: categories}) );
                  layout.content.show( new CategoriesView({collection: categories}) );
            });
        });
        layout.setMonth(0);
        
        return;
        
		
		
		var transactions = CashTrack.request('transactions');
		transactions = _.sortBy( transactions, 'date');
		var min = transactions[0].date.getFullYear(), max = transactions[ transactions.length - 1].date.getFullYear();
		for( var i = min; i <= max; i++ ) {
			$('<option>').attr('value', i).text( i ).appendTo( years );
		}
		
		var container = $( page ).find('.categories');
		_.each( categories, function( category ) {
			var $item = $('<li>').addClass('category').appendTo( container );
				$item.append( $('<span>').addClass('color').css({'background-color': category.color, 'border-color': darken( category.color, 50) }) );
				$item.append( $('<span>').addClass('name').text( category.name ) );
				$item.append( $('<span>').addClass('percentage').text( Globalize.format( category.amount / categories.sum, 'p')) );
				$item.append( $('<span>').addClass('amount').text( Globalize.format( category.amount, 'c') ) );
				
				
		});
		
	});
}, function() {
	this.paper && this.paper.remove();
});