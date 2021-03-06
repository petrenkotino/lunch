
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Handle Errors gracefully
app.use(function(err, req, res, next) {
    if(!err) return next();
    console.log(err.stack);
    res.json({error: true});
});

if('development' == app.get('env')) {
    app.use(express.logger('dev'));
}

app.get('/', routes.index);

// MongoDB API Routes
app.get('/today/today', routes.list);
app.get('/today/:eventId', routes.lunchEvent);
app.post('/go', routes.register);
app.post('/today', routes.createEvent);

app.get('/menus/menus', routes.menusList);

io.sockets.on('connection', routes.register);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
