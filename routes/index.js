var mongoose = require('mongoose');
var db;
if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
    db = mongoose.createConnection('localhost', 'lunchapp');
}

var EventSchema = require('../models/Event.js').EventSchema;
var Event = db.model('events', EventSchema);

// Main app view
exports.index = function (req, res) {
    res.render('index');
};

// JSON API for list of events
exports.list = function(req, res) {
    Event.find({}, 'location', function (error, events) {
        res.json(events);
    });
};

exports.lunchEvent = function(req, res) {
    var eventId = req.params.eventId;
    
    Event.findById(eventId, '', { lean: true }, function (err, event) {
        if (event) {
            var userIsGoing = false;
            var userOrder;
            var totalParticipants = 0;

            for (p in event.participants) {
                var participant = event.participants[p];
                var ip = req.headers["x-forwarded-for"];
                if (ip) {
                    var list = ip.split(",");
                    ip = list[list.length-1];
                } else {
                    ip = req.connection.remoteAddress;
                }
                if (participant.ip === ip) {
                    userIsGoing = true;
                    for(o in event.orders) {
                        var order = event.orders[o];
                        userOrder = {
                            _id: order._id,
                            orderText: order.order
                        };
                    }
                }
            }
            
            event.userIsGoing = userIsGoing;
            event.userOrder = userOrder;
            event.totslParticipants = event.participants.length;
            
            res.jsonp(event);
        } else {
            res.json({ error: true });
        }
    });
};

exports.createEvent = function (req, res) {
    var ip = req.headers["x-forwarded-for"];
    if (ip) {
        var list = ip.split(",");
        ip = list[list.length-1];
    } else {
        ip = req.connection.remoteAddress;
    }
    var reqBody = req.body;
    
    
    var eventObj = {
        location: reqBody.location,
        orders: reqBody.orders,
        participants: []
    };
    eventObj.participants.push({ip: ip});
    
    var event = new Event(eventObj);
    
    event.save(function (err, doc) {
        if (err || !doc) {
            throw  'Error';
        } else {
            res.json(doc);
        }
    });
};

exports.register = function (socket) {
    socket.on('send:go', function (data) {
        var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;

        Event.findById(data.event_id, function (err, event) {
            event.orders = event.orders.concat(data.userOrders);
            event.save(function (err, doc) {
                var theDoc = {
                    location: doc.location,
                    _id: doc._id,
                    orders: doc.orders
                };

                socket.emit('mychoice', theDoc);
                socket.broadcast.emit('go', theDoc);
            });
        });
    });
};