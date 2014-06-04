// Declare app level module which depends on filters, and services
angular.module('modulusOne', [
  'ngRoute',
  'ngSanitize',
  'restangular',
  'modulusOne.config',
  'modulusOne.filters',
  'modulusOne.services',
  'modulusOne.directives',
  'modulusOne.listControllers',
  'modulusOne.showControllers',
  'modulusOne.createControllers',
  'modulusOne.searchControllers',
  'modulusOne.authControllers',
  'xeditable',
  'angularFileUpload',
  'ui.bootstrap'
]).
config(function($routeProvider, RestangularProvider) {

  $routeProvider.when('/', {
    templateUrl: 'partials/search.html',
    controller: 'SearchCtrl',
    title: null,
    resolve: {
      auth: function resolveAuth(AuthService) {
        return AuthService.waitUntilLoaded;
      }
    }
  })

  $routeProvider.when('/search', {
    templateUrl: 'partials/search.html',
    controller: 'SearchCtrl',
    resolve: {
      auth: function resolveAuth(AuthService) {
        return AuthService.waitUntilLoaded;
      }
    }
  })

  $routeProvider.when('/show/:id/:slug?', {
    templateUrl: 'partials/showModule.html',
    controller: 'ShowModuleCtrl',
    resolve: {
      auth: function resolveAuth(AuthService) {
        return AuthService.waitUntilLoaded;
      }
    }
  })

  $routeProvider.when('/create', {
    templateUrl: 'partials/createModule.html',
    title: "Upload Module",
    controller: "CreateCtrl",
    resolve: {
      auth: function resolveAuth(AuthService) {
        return AuthService.waitUntilLoaded;
      }
    }
  })

  $routeProvider.when('/browse/:page?', {
    templateUrl: 'partials/browse.html',
    controller: "ListModulesCtrl",
    title: "Recently Updated Modules",
    resolve: {
      auth: function resolveAuth(AuthService) {
        return AuthService.waitUntilLoaded;
      }
    }
  })

  $routeProvider.otherwise({redirectTo: '/'});

}).
run(function($rootScope, editableOptions, Restangular, $route, Alert,
  prepareModule, Config) {
  editableOptions.theme = 'bs3'

  $rootScope.Config = Config

  Restangular.setBaseUrl(Config.api.baseUrl + '/api' ||
    '/api')

  var apiError = new Alert('danger', 'Uh oh! Error communicating with the Modulus server.')
  Restangular.setErrorInterceptor(function(response, promise) {

    if (console.error) {
      console.error('Modulus API Error', response)
    }
    apiError.details = _.template('<%=config.method%> <%=config.url%> <%=status%>', response)
    apiError.open()
  })

  Restangular.addResponseInterceptor(function(data, operation, what, url,
    response, deferred) {

      if (response.status < 500 && apiError.isOpen) {
        apiError.close()
      }

      return data
  })

  Restangular.addRequestInterceptor(function(element) {
    if (element && element.class === "org.openmrs.modulus.Module") {
      element = prepareModule(element)
    }
    return element
  })


  $rootScope.$on('$routeChangeSuccess', function(evt, data) {
    $rootScope.title = $route.current.title
    $rootScope.controller = $route.current.controller
  })

});
