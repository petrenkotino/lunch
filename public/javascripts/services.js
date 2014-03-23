/**
 * Created with IntelliJ IDEA.
 * User: konstantin
 * Date: 3/16/14
 * Time: 6:28 PM
 * To change this template use File | Settings | File Templates.
 */
// Angular service module for connecting to JSON APIs
angular.module('eventsServices', ['ngResource']).
    factory('Event',function ($resource) {
        return $resource('today/:eventId', {}, {
            // Use this method for getting a list of events
            query: { method: 'GET', params: { eventId: 'today' }, isArray: true }
        })
    }).factory('socket', function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });
