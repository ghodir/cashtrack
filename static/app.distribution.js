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
          var items = this.collection.map( function( category ) {
            return [category.get('amount'), category.get('name'), category.get('color')];
          });
        
          this.paper.drawPieChart( width * 0.5, height * 0.5, Math.min( width, height ) * 0.5, items);
        }
    });
    
    var DistributionView = Backbone.Marionette.CompositeView.extend({
      el: $( page ).find('.app-section'),
      initialize: function( options ) {        
       
      },
    });
    
    var DistributionLayout = Backbone.Marionette.Layout.extend({
      el: page,
      regions: {
        chart: '.chart-region',
        content: '.app-section',
      },
      events: {
        'change .years': 'onChange',
        'change .months': 'onChange',
      },
      initialize: function() {
        var months = this.$el.find('.months');
		for(var i = 0; i < 12; i++) {
			$('<option>').attr('value', i).text( Globalize.culture().calendars.standard.months.names[i] ).appendTo( months );
		}
        
        var self = this;
        $.when( CashTrack.request('transactions', {count: 1}) )
         .then( function(transactions) {
             if( !transactions.length )
               return;
             
             var years = self.$el.find('.years');
             var min = transactions.models[0].get('date').getFullYear(),
                 max = (new Date()).getFullYear();
             while( max >= min++ )
               $('<option>').attr('value', min - 1).text( min - 1 ).appendTo( years );
         });
         
         $.when( CashTrack.request('categories', 0) )
          .then( function( categories ) {
            self.chart.show( new ChartView({collection: categories}) );   
          });
      },
      onChange: function() {
        var year = this.$el.find('.years').val();
        var month = this.$el.find('.months').val();
        
        var now = new Date(),
            then = new Date( year, month, 1);
            
        this.showMonth( now.getMonth() - parseInt(month) + 12 * ( now.getFullYear() - parseInt(year) ) );
      },
      showMonth: function( month ) {
        
      }
    });
    
	$(page).on('appShow', function() {
        CashTrack.request('categories', 0).then( function( categories ) {
          var layout = new DistributionLayout();
              layout.chart.show( new ChartView({collection: categories}) );
              layout.content.attachView( new DistributionView({collection: categories}) );
		  
        });
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