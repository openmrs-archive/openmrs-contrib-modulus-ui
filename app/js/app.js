'use strict';


// Declare app level module which depends on filters, and services
angular.module('modulusOne', [
  'ngRoute',
  'ngResource',
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

  $routeProvider.when('/show/:id', {templateUrl: 'partials/showModule.html',
    controller: 'ShowModuleCtrl'})

  $routeProvider.when('/create', {templateUrl: 'partials/createModule.html'})

  $routeProvider.otherwise({redirectTo: '/'});

}]).
run(function(editableOptions) {
  editableOptions.theme = 'bs3'
});
