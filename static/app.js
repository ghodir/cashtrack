(function() {
	"use strict";
	
	// Create local references to array methods we'll want to use later.
	var array = [];
	var push = array.push;
	var slice = array.slice;
	var splice = array.splice;

	
	var root;
	root = this;
	
	var extend = function(name, protoProps, staticProps) {
		var parent = this;
		var child;
		
		if( protoProps && _.has(protoProps, 'constructor') ) {
			child = protoProps.constructor;
		} else {
			child = eval('function ' + name + '(){ return parent.apply(this, arguments); }; ' + name);
		}
		
		_.extend(child, parent, staticProps);
		
		var Surrogate = function() { this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;
		
		if( protoProps )
			_.extend( child.prototype, protoProps );
			
		child.__super__ = parent.prototype;
		return child;
	};
	
	var Handlers = function(options) {
		this.options = options;
		this._handlers = {};
		
		this.initialize( arguments );
	};
	
	Handlers.extend = extend;
	
	_.extend(Handlers.prototype, {
		initialize: function() {},
		setHandlers: function(handlers) {
			_.each(handlers, function(handler, name) {
				var context = null;
				
				if( _.isObject(handler) && !_.isFunction(handler) ) {
					context = handler.context;
					handler = handler.callback;
				}
				
				this.setHandler(name, handler, context);
			}, this);
		},
		setHandler: function(name, handler, context) {
			var cfg = {
				callback: handler,
				context: context
			};
			
			this._handlers[name] = cfg;
		},
		hasHandler: function(name) {
			return !! this._handlers[name];
		},
		getHandler: function( name ) {
			var cfg = this._handlers[name]
			
			if(!cfg) {
				throw new Error('Handler not found for \'' + name + '\'.');
			}
			
			return function() {
				var args = Array.prototype.slice.apply( arguments );
				return cfg.callback.apply( cfg.context, args );
			};
		},
		removeHandler: function(name) {
			delete this._handlers[name];
		},
		removeAllHandlers: function() {
			this._handlers = {};
		}
	});
	
	var RequestResponse = Handlers.extend('RequestResponse', {
		request: function() {
			var name = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			return this.getHandler(name).apply(this, args);
		}
	});
	
	var Commands = Handlers.extend('Commands', {
		execute: function() {
			var name = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			this.getHandler(name).apply(this, args);
		}
	});
	
	
	var Application = root.Application = function(options) {
		this.reqres = new RequestResponse();
		this.commands = new Commands();
		this._templateCache = {};
		this.initialize( arguments );
	}
	
	_.extend(Application.prototype, {
		initialize: function() {},
		request: function() {
			var args = Array.prototype.slice.apply( arguments );
			return this.reqres.request.apply(this.reqres, args);
		},
		execute: function() {
			return this.commands.execute.apply(this.commands, arguments);
		},
		start: function() {
			
			this.trigger('start:before');
			
			try {
				App.restore();
			} catch( err ) {
				App.load('home');
			}
			
			this.trigger('start');
		},
	});
	
	Application.render = (function( template, data ) {
		var cache = {};
		
		return function( template, data ) { 
			if( !cache[ template ] )
				cache[ template ] = _.template( $( template ).html() );
			return cache[ template ]( data );
		}
	})();
	
	
	
	//Taken from Backbone

	// A module that can be mixed in to *any object* in order to provide it with
	// custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = {};
	//     _.extend(object, Backbone.Events);
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	var Events = Application.Events = {

		// Bind an event to a `callback` function. Passing `"all"` will bind
		// the callback to all events fired.
		on: function(name, callback, context) {
			if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
			this._events || (this._events = {});
			var events = this._events[name] || (this._events[name] = []);
			events.push({callback: callback, context: context, ctx: context || this});
			return this;
		},

		// Bind an event to only be triggered a single time. After the first time
		// the callback is invoked, it will be removed.
		once: function(name, callback, context) {
			if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
			var self = this;
			var once = _.once(function() {
				self.off(name, once);
				callback.apply(this, arguments);
			});
			once._callback = callback;
			return this.on(name, once, context);
		},

		// Remove one or many callbacks. If `context` is null, removes all
		// callbacks with that function. If `callback` is null, removes all
		// callbacks for the event. If `name` is null, removes all bound
		// callbacks for all events.
		off: function(name, callback, context) {
			var retain, ev, events, names, i, l, j, k;
			if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
			if (!name && !callback && !context) {
				this._events = {};
				return this;
			}

			names = name ? [name] : _.keys(this._events);
			for (i = 0, l = names.length; i < l; i++) {
				name = names[i];
				if (events = this._events[name]) {
					this._events[name] = retain = [];
					if (callback || context) {
						for (j = 0, k = events.length; j < k; j++) {
							ev = events[j];
							if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
								(context && context !== ev.context)) {
								retain.push(ev);
							}
						}
					}
					if (!retain.length) delete this._events[name];
				}
			}

			return this;
		},

		// Trigger one or many events, firing all bound callbacks. Callbacks are
		// passed the same arguments as `trigger` is, apart from the event name
		// (unless you're listening on `"all"`, which will cause your callback to
		// receive the true name of the event as the first argument).
		trigger: function(name) {
			if (!this._events) return this;
			var args = slice.call(arguments, 1);
			if (!eventsApi(this, 'trigger', name, args)) return this;
			var events = this._events[name];
			var allEvents = this._events.all;
			if (events) triggerEvents(events, args);
			if (allEvents) triggerEvents(allEvents, arguments);
			return this;
		},

		// Tell this object to stop listening to either specific events ... or
		// to every object it's currently listening to.
		stopListening: function(obj, name, callback) {
			var listeners = this._listeners;
			if (!listeners) return this;
			var deleteListener = !name && !callback;
			if (typeof name === 'object') callback = this;
			if (obj) (listeners = {})[obj._listenerId] = obj;
			for (var id in listeners) {
				listeners[id].off(name, callback, this);
				if (deleteListener) delete this._listeners[id];
			}
			return this;
		}

	};

	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	// Implement fancy features of the Events API such as multiple event
	// names `"change blur"` and jQuery-style event maps `{change: action}`
	// in terms of the existing API.
	var eventsApi = function(obj, action, name, rest) {
		if (!name) return true;

		// Handle event maps.
		if (typeof name === 'object') {
			for (var key in name) {
				obj[action].apply(obj, [key, name[key]].concat(rest));
			}
			return false;
		}

		// Handle space separated event names.
		if (eventSplitter.test(name)) {
			var names = name.split(eventSplitter);
			for (var i = 0, l = names.length; i < l; i++) {
				obj[action].apply(obj, [names[i]].concat(rest));
			}
			return false;
		}

		return true;
	};

	// A difficult-to-believe, but optimized internal dispatch function for
	// triggering events. Tries to keep the usual cases speedy (most internal
	// Backbone events have 3 arguments).
	var triggerEvents = function(events, args) {
		var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
		switch (args.length) {
			case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
			case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
			case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
			case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
			default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
		}
	};

	var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

	// Inversion-of-control versions of `on` and `once`. Tell *this* object to
	// listen to an event in another object ... keeping track of what it's
	// listening to.
	_.each(listenMethods, function(implementation, method) {
		Events[method] = function(obj, name, callback) {
			var listeners = this._listeners || (this._listeners = {});
			var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
			listeners[id] = obj;
			if (typeof name === 'object') callback = this;
			obj[implementation](name, callback, this);
			return this;
		};
	});
	
	
	_.extend( Application.prototype, Events);
	
	
	var Model = Application.Model = function( data ) {
		_.extend( this, data );
	};
	
	Model.extend = extend;
	
	var Collection = Application.Collection = function( options ) {
		this._reset();
		if( _.isArray( options ) ) {
			_.each(options, function( element ) {
				this.push( element );
			}, this);
		}
		this.initialize.apply(this, arguments);
	}
	
	_.extend(Collection.prototype, {
		initialize: function() {},
		each: function( cb, context) {
			_.each( this.models, cb, context);
			return this;
		},
		push: function( model ) {
			this.models.push( model );
			this._byID[ model.id ] = model;
			this.length++;
			return this;
		},
		sortBy: function( iterator ) {
			this.models = _.sortBy( this.models, iterator);
			return this;
		},
		reverse: function() {
			this.models = this.models.reverse();
			return this;
		},
		get: function( id ) {
			return this._byID[ id ];
		},
		_reset: function() {
			this.sum = 0.0;
			this.models = [];
			this.length = 0;
			this._byID = {};
		}
	});
	
	Collection.extend = extend;
	
  
}).call(this);