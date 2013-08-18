Raphael.fn.drawPieChart = function(cx, cy, radius, items) {
	var paper = this,
		rad = Math.PI / 180,
		chart = this.set();
		
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
		
	function sector(cx, cy, r, start, end) {
		var x1 = cx - r * Math.sin( start * rad ),
			x2 = cx - r * Math.sin(   end * rad ),
			y1 = cy - r * Math.cos( start * rad ),
			y2 = cy - r * Math.cos(   end * rad );
		return [x1, y1, x2, y2];
	}
	
	var angle = 0,
		total = 0;
		
	function drawSegment( i ) {
		var r1 = radius - 20,
			r2 = radius - 10,
			value = items[ i ].value,
			color1 = items[ i ].color,
			color2 = colorLuminance(color1, -.5),
			delta = value / total * 360.0,
			coords1 = sector(cx, cy, r1, angle + 2, angle + delta - 2 ),
			coords2 = sector(cx, cy, r2, angle + 2, angle + delta - 2),
			path  = paper.path(['M', coords1[0], coords1[1], 'L', coords2[0], coords2[1], 
								'A', r2, r2, 0, +(delta > 180), 0, coords2[2], coords2[3],
								'L', coords1[2], coords1[3], 'A', r1, r1, 0, +(delta > 180),
								1, coords1[0], coords1[1]]);
			path.attr({
				fill: color1,
				stroke: color2,
				'stroke-width': 1,
			});
			
			angle += delta;
			chart.push( path );
	}

	for( var i = items.length; i; i-- ) {
		total += items[i - 1].value;
	}
	
	items = _.sortBy( items, 'value' );
	
	for( var i = 0; i < items.length; i++ ) {
		drawSegment( i );
	}
}