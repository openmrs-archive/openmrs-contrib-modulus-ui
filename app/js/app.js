// Declare app level module which depends on filters, and services
angular.module('modulusOne', [
  'ngRoute',
  'ngResource',
  'restangular',
  'modulusOne.filters',
  'modulusOne.services',
  'modulusOne.directives',
  'modulusOne.controllers',
  'modulusOne.createControllers',
  'xeditable',
  'angularFileUpload'
]).
config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/', {templateUrl: 'partials/listModules.html',
    controller: 'ListModulesCtrl'})

  $routeProvider.when('/show/:id/:slug?', {templateUrl: 'partials/showModule.html',
    controller: 'ShowModuleCtrl'})

  $routeProvider.when('/create', {templateUrl: 'partials/createModule.html'})

  $routeProvider.otherwise({redirectTo: '/'});

}]).
run(function(editableOptions, Restangular) {
  editableOptions.theme = 'bs3'

  Restangular.setBaseUrl(window.MODULUS_API_BASE_URL ||
    '/api')

  window.Restangular = Restangular
});
