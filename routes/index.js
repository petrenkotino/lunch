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
    var eventId = req.params.id;
    
    Event.findById(eventId, '', { lean: true }, function (err, event) {
        if (event) {
            var userIsGoing = false;
            var userOrder;
            var totalParticipants = 0;
            event.participants.count({}, function (error, count) {
                if (error) {
                    console.log('Error while counting ' + error);
                } else {                    
                    totalParticipants = count;
                }
            });
            
            for (o in event.orders) {
                var order = event.orders[o];
                
                for (p in order.participants) {
                    var participant = order.participants[p];
                    if (participant.ip === (req.header('x-forwarded-for') || req.ip)) {
                        userIsGoing = true;
                        userOrder = {
                            _id: order._id,
                            orderText: order.order
                        };
                    }
                }
            }
            
            event.userIdGoing = userIsGoing;
            event.userOrder = userOrder;
            event.totslParticipants = totalParticipants;
            
            res.jsonp(event);
        } else {
            res.json({ error: true });
        }
    });
};

exports.createEvent = function (req, res) {
    var reqBody = req.body;
    
    var eventObj = {
        location: reqBody.location
    };
    
    var event = new Event(eventObj);
    
    event.save(function (err, doc) {
        if (err || !doc) {
            throw  'Error';
        } else {
            res.json(doc);
        }
    });
};