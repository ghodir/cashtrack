(function() {
	"use strict";
	
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
	}
	
	_.extend(Application.prototype, {
		request: function() {
			var args = Array.prototype.slice.apply( arguments );
			return this.reqres.request.apply(this.reqres, args);
		},
		execute: function() {
			return this.commands.execute.apply(this.commands, arguments);
		}
	});
	
}).call(this);