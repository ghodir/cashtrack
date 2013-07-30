var restify = require('restify');
var mysql = require('mysql');
	
var formatters = require('./formatters');	

var server;

server = restify.createServer({
	formatters: {
		'application/json': formatters.formatJSON,
	}
});
	
var c = mysql.createConnection({
	host: 'aionlabs.de',
	user: 'cashtrack',
	password: 'V7G6XTQAPcPUYBJM',
});

/*
c.connect(function(err) {
	if( err ) return cb(err);
	
	server.db = c;
	
	
});
*/
server.listen( 80, function() {
		
	});
	
server.use( restify.bodyParser({mapParams: false}) );
server.use( restify.queryParser({mapParams: false}) );

server.on('error', function(req, res, route, err) {
	res.send(err);
});

server.on('uncaughtException', function(req,res,route,err) {
	if( err instanceof errors.CatchableError ) {
		console.log('Catchable Error: ' + err);
		res.send(err.status, err);
	} else {
		console.log('Uncaught exception: ');
		console.log(err);
		console.log(err.stack);
	}
});

server.get('/api/users/:id/nodes/', function(req, res, next) {
	res.send([
		{
			id: 1,
			name: 'Gehalt',
			type: 'income',
			icon: 'coin',
			actual: 5400,
			budget: 10200,
			color: 'emerald'
		},
		{
			id: 2,
			name: 'Bank',
			type: 'account',
			icon: 'library',
			actual: 50,
			budget: null,
			color: 'pomegranate'
		},
		{
			id: 3,
			name: 'Kreditkarte',
			type: 'account',
			icon: 'credit',
			actual: 10,
			budget: 1000,
			color: 'pumpkin'
		},
		{
			id: 4,
			name: 'Lebensmittel',
			type: 'category',
			icon: 'apple',
			actual: 5,
			budget: 40,
			color: 'emerald'
		},
		{
			id: 5,
			name: 'Restaurant',
			type: 'category',
			icon: 'food',
			actual: 30,
			budget: 50,
			color: 'belize-hole'
		},
		{
			id: 6,
			name: 'Urlaub',
			type: 'goal',
			icon: 'airplane',
			actual: 120,
			budget: 800,
			color: 'orange'
		}
	]);
	next( false );
});

server.get( '/', restify.serveStatic({
	directory: './static',
	default: 'index.html',
}));

server.get( /static\/(.*)/, restify.serveStatic({
	directory: './static',
	default: 'index.html',
}));


// 01725197294