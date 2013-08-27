App.populator('budget', function(page, args) {
  var MonthView = Marionette.View.extend({
    el: $( page ).find('.month-region'),
    render: function() {
      var now = new Date(), y = now.getFullYear(), m = now.getMonth();
      var first = new Date(y, m, 1);
      var last = new Date(y, m + 1, 0);
      
      var percentage = (now - first) / ( last - first);
      
      this.$el.find('.first').html( '&lsaquo; ' + Globalize.format( first, 'M'));
      this.$el.find('.last').html( Globalize.format( last, 'M') + ' &rsaquo;');
     
      
      var start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 0);
          
      this.$el.find('.progress').css('left',  (start - first)/(last-first) * 100 + '%');
      this.$el.find('.progress').css('right',  (1 - (end - first)/(last-first)) * 100 + '%');
      this.$el.find('.today').text('Heute').css('left', ((start - first)/(last-first) + (end - first)/(last-first) ) / 2 * 100 + '%');
     
      
      return this;      
    }
  });
  
  var CategoryView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'category',
    template: '#budget-category-template',
    initialize: function( options ) {
      this.model.set('budget', 1000.0);
    },
    onDomRefresh: function() {
      var bar = this.$el.find('.bar .value');
      bar.width( this.model.get('amount')  / this.model.get('budget') * 100 + '%' );
      
      var diff = this.$el.find('.label .difference');
      var amount = this.model.get('amount'), budget = this.model.get('budget');
      if( amount > budget ) {
        diff.addClass('negative').text( Globalize.format( budget - amount, 'c') );
      } else if( amount < budget ) {
        var now = new Date(), y = now.getFullYear(), m = now.getMonth();
        var first = new Date(y, m, 1);
        var last = new Date(y, m + 1, 0);
        
        if( amount/budget >  (now - first) / ( last - first) )
          diff.addClass('warning').text( Globalize.format( budget - amount, 'c') );
        else
          diff.addClass('positive').text( Globalize.format( budget - amount, 'c') );
      } else  {
        diff.text('You did it :)');
      }
    }
  });
  
  var CategoriesList = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'categories',
    itemView: CategoryView,
    initialize: function( options ) {
      var amount = this.collection.sum;
      this.collection.add( new CashTrack.entities.Category({
        name: 'Gesamt',
        amount: amount,
        budget: 352.90,
        color: '#aaa'
      }) );
    }
  });
  
  var Layout = Marionette.Layout.extend({
    el: $( page )[0],
    regions: {
      month: '.month-region',
      categories: '.categories-region',
    },
    initialize: function( options ) {
      var self = this;
      self.month.attachView( new MonthView().render() );
      CashTrack.request('categories', 0).then( function( categories) {
        self.categories.show( new CategoriesList({ collection: categories}) );
      });
    },
  });
  
  $( page ).on('appShow', function() {
    $.when( CashTrack.request('categories') )
     .then( function(categories) {
       var layout = new Layout();
     });
  });
});