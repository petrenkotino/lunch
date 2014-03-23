/**
 * Created with IntelliJ IDEA.
 * User: konstantin
 * Date: 3/16/14
 * Time: 6:03 PM
 * To change this template use File | Settings | File Templates.
 */
function OrderCtrl($scope) {
    $scope.addOrder = function() {
        $scope.event.orders.push({ order: '' });
    };
}

function ListEventsCtrl($scope, Event) {
    $scope.events = Event.query();
}

function NewEventCtrl($scope, $location, Event) {
    $scope.event = {
        location: '',
        orders: []
    };
    $scope.event.orders.push({ order: '' });
    
    $scope.addOrder = function() {
        $scope.event.orders.push({ order: '' });
    };
    
    $scope.createEvent = function() {
        var event = $scope.event;
        
        if (event.location.length > 0) {            
            var ordersCount = 0;
            for (var i = 0; i < event.orders.length; i++) {
                var order = event.orders[i];                
                if(order.order.length > 0) {
                    ordersCount++;
                }
            }
            if (ordersCount > 0) {
                var newEvent = new Event(event);
                newEvent.$save(function (p, resp) {
                    if (!p.error) {
                        $location.path('today');
                    } else {
                        alert('Could not create event');
                    }
                });
            } else {
                alert('Please place your order');
            }
        } else {
            alert("Please provide a location for this event");
        }                
    };
}

// Controller for an individual event
function ViewEventCtrl($scope, $routeParams, socket, Event) {
    $scope.newOrders = [];
    $scope.newOrders.push({ order: '' });

    $scope.addOrder = function() {
        $scope.newOrders.push({ order: '' });
    };
    
    $scope.event = Event.get({
        eventId: $routeParams.eventId
    });

    socket.on('mychoice', function (data) {
        console.dir(data);
        if (data._id === $routeParams.eventId) {
            $scope.event = data;
        }
    });

    socket.on('go', function (data) {
        console.dir(data);
        if (data._id === $routeParams.eventId) {
            $scope.event.location = data.location;
            $scope.event.orders = data.orders;
        }
    });

    $scope.go = function () {
        var eventId = $scope.event._id;
        var userOrders = $scope.newOrders;

        $scope.newOrders = [];
        $scope.newOrders.push({ order: '' });

        if (userOrders) {
            var voteObj = {
                event_id: eventId,
                userOrders: userOrders
            };
            socket.emit('send:go', voteObj);
        } else {
            alert('You must enter your order');
        }
    };
}