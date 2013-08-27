
var deferred = $.Deferred();
	
CashTrack = new Application();
CashTrack.db = {};
CashTrack.db.ready = deferred.promise();

CashTrack.on('start:before', function() {
  CashTrack.settings = new Backbone.Model({
    'monthly-budget': 100
  });
  
	var request = window.indexedDB.open('cashtrack', 1);
		request.onerror = function( event ) {
			console.log( event.target.errorCode );
			CashTrack.trigger('db:error', event.target);
			deferred.reject( this.errorCode );
		};
		request.onsuccess = function( event ) {
			CashTrack.trigger('db:open', event.target.result);
			deferred.resolveWith( this, [event.target.result,] );
		}
		request.onupgradeneeded = function( event ) {
			CashTrack.trigger('db:upgrade', event.target.result);
		}
});
	
	
function colorLuminance(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

function darken( hex, percentage ) {
	return colorLuminance( hex, -percentage * 0.01 );
}

function lighten( hex, percentage ) {
	return colorLuminance( hex, percentage * 0.01 );
}

var colors = [ '#1ABC9C','#16A085','#2ECC71','#27AE60','#3498DB','#2980B9','#9B59B6','#8E44AD','#34495E	','#2C3E50','#F1C40F','#F39C12','#E67E22','#D35400','#E74C3C','#C0392B','#ECF0F1','#BDC3C7','#95A5A6','#7F8C8D'];
function hexToRgb(hex) {
	var bigint = parseInt(hex.slice(1), 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;

	return r + "," + g + "," + b;
}

jQuery.extend( jQuery.easing,
{
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
});

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if( !window.indexedDB )
	alert('Your browser doesn\'t support a stable version of indexedDB');

	
_.templateSettings = {
    evaluate:    /\{%(.+?)%\}/g,
    interpolate: /\{\{(.+?)\}\}/g,
    escape:      /\{\{=(.+?)\}\}/g
};

(function() {
  var tmp = Backbone.Marionette.View.prototype.mixinTemplateHelpers
  Backbone.Marionette.View.prototype.mixinTemplateHelpers = function( target ) {
    target.format = function() { return Globalize.format.apply(Globalize, arguments); }
    return tmp.call(this,target );
  }
})();
