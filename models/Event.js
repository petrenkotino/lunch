/**
 * Created with IntelliJ IDEA.
 * User: konstantin
 * Date: 3/14/14
 * Time: 8:22 AM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');

// Subdocument schema for participants
var participateSchema = new mongoose.Schema({
    ip: 'String'
});

var orderSchema = new mongoose.Schema({
    order: {type: String, required: true },
    forSharing: Boolean,
    participants: [participateSchema]
});

exports.EventSchema = new mongoose.Schema({
    location: {type: String, required: true },
    orders: [orderSchema]
});