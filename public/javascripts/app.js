/**
 * Created with IntelliJ IDEA.
 * User: konstantin
 * Date: 3/16/14
 * Time: 2:56 PM
 * To change this template use File | Settings | File Templates.
 */
// Angular module defining routes for the app
angular.module('lunch', ['ngRoute', 'eventsServices'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/today', {
                templateUrl: 'partials/list.html',
                controller: ListEventsCtrl
            })
            .when('/today/:eventId', {
                templateUrl: 'partials/item.html',
                controller: ViewEventCtrl
            })
//            .when('/go', {
//                templateUrl: '',
//                controller: {}
//            })
            .when('/create', {
                templateUrl: 'partials/new.html',
                controller: NewEventCtrl
            })
            .otherwise({ redirectTo: '/today' });
    }]);
