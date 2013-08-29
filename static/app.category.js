App.populator('category', function( page, args ) {
  CashTrack.Control = Backbone.View.extend({
    events: {
      'focus .value': 'onFocus',
      'blur .value': 'onBlur',
    },
    initialize: function( options ) {
      this.model = options.model;
    },
    delegateEvents: function( events ) {
      events = events || this.events;
      
      _.extend(events, this.configureTriggers() );
      
      Backbone.View.prototype.delegateEvents.call(this, events )
    },
    configureTriggers: function() {
      if(!this.triggers) return;
      
      var events = {};
      _.each( this.triggers, function(value, key) {
        events[key] = function( e ) {
          if( e && e.preventDefault) { e.preventDefault(); }
          if( e && e.stopPropagation) { e.stopPropagation(); }
          
          this.trigger(value, this);
        }
      });
    }
  });
  
  CashTrack.TextField = CashTrack.Control.extend({
    tagName: 'div',
    className: 'control text',
    events: {
      'keydown .value': 'onKeyDown',
      'change .value': 'onChange',
      'focus .value': 'onFocus',
      'blur .value': 'onBlur',
    },
    initialize: function( options ) {
      this.field = options.field;
      this.format = options.format;
      this.type = options.type;
    },
    render: function() {
      this._value = $('<input>')
                    .addClass('value')
                    .val( this.model.get(this.field) )
                    .appendTo( this.$el );
      return this;
    },
    onChange: function() {
      var v = this._value.val();
      switch( this.type ) {
        case 'int': v = Globalize.parseInt( v ); break;
        case 'float': v = Globalize.parseFloat( v ); break;
        default: break;
      }
      this.model.set( this.field, v);
    },
    onKeyDown: function( e ) {
      
    },
    onFocus: function() {
      this.$el.addClass('focus');
    },
    onBlur: function() {
      this.$el.removeClass('focus');
    }
  });
  
  CashTrack.Button = CashTrack.Control.extend({
    tagName: 'button',
    className: 'control button',
    events: {
      'click': 'onClick',
    },
    initialize: function( options ) {
      this.label = options.label;
      this.options = options;
    },
    render: function() {
      this.$el.text( this.label );
    },
    onClick: function() {
      this.$el.focus();
      this.trigger(this.options.onClick);
    }
  });
  
  CashTrack.ColorPickerView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'input select',
    initialize: function() {
      
    }
  });
  
  var Layout = Backbone.Marionette.Layout.extend({
    el: $( page ),
    regions: {
      name:  '.name-region',
    },
    initialize: function( options ) {
      this.name.show( new CashTrack.InputView({ model: this.model, field: 'name'}) );
    }
  });
  
  CashTrack.LinearLayout = Backbone.View.extend({
    className: 'layout layout-linear',
    initialize: function( options ) {
      this.views = {};
      this.length = 0;
    },
    appendView: function( view ) {
      var cid = view.cid;
      this.views[cid] = view;
      this.length++;
      
      this.listenTo( view, 'all', function() {
       this.trigger.apply(this, arguments);
      });
      view.render();
      this.$el.append( view.$el );
    }
  });
  
  $( page ).on('appShow', function() {
    
    $.when( CashTrack.request('category', args.id) )
     .then( function( category ) {
        var layout = new CashTrack.LinearLayout({ el: $( page ).find('.app-content').children()[0] });
            layout.appendView( new CashTrack.TextField({ model: category, field: 'name'}) );
            
              var view = new CashTrack.LinearLayout({});
                  view.appendView( new CashTrack.TextField({ model: category, field: 'budget'}) );
                  view.appendView( new CashTrack.TextField({ model: category, field: 'color'}) );
              
            layout.appendView( view );
            layout.appendView( new CashTrack.Button({label: 'Save', onClick: 'save'}) );
            
            layout.on('save', function() {
              alert('save');
            });
     });
  });
});