// Declare app level module which depends on filters, and services
angular.module('modulusOne', [
  'ngRoute',
  'restangular',
  'modulusOne.filters',
  'modulusOne.services',
  'modulusOne.directives',
  'modulusOne.controllers',
  'modulusOne.createControllers',
  'modulusOne.searchControllers',
  'xeditable',
  'angularFileUpload'
]).
config(['$routeProvider', function($routeProvider, $route) {

  $routeProvider.when('/', {
    templateUrl: 'partials/search.html',
    controller: 'SearchCtrl',
    title: null,
  })

  $routeProvider.when('/search/:query?', {
    templateUrl: 'partials/search.html',
    controller: 'SearchCtrl'
  })

  $routeProvider.when('/show/:id/:slug?', {
    templateUrl: 'partials/showModule.html',
    controller: 'ShowModuleCtrl'
  })

  $routeProvider.when('/create', {
    templateUrl: 'partials/createModule.html',
    title: "Upload Module"
  })

  $routeProvider.when('/browse/:page?', {
    templateUrl: 'partials/browse.html',
    controller: "ListModulesCtrl",
    title: "Recently Updated Modules"
  })

  $routeProvider.otherwise({redirectTo: '/'});

}]).
run(function($rootScope, editableOptions, Restangular, $route) {
  editableOptions.theme = 'bs3'

  Restangular.setBaseUrl(window.MODULUS_API_BASE_URL ||
    '/api')

  window.Restangular = Restangular

  $rootScope.$on('$routeChangeSuccess', function(evt, data) {
    $rootScope.title = $route.current.title
    $rootScope.controller = $route.current.controller
  })
});
