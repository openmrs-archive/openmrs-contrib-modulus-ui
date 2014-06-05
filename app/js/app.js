// Declare app level module which depends on filters, and services
angular.module('modulusOne', [
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
  'ui.bootstrap',
  'ui.router'
]).
config(function($stateProvider, $urlRouterProvider, RestangularProvider) {

  function resolveAuth(AuthService) {
    return AuthService.waitUntilLoaded;
  }

  $stateProvider
  .state('search', {
    url: '/search',
    templateUrl: 'partials/search.html',
    controller: 'SearchCtrl',
    resolve: {
      auth: resolveAuth
    },
    date: {
      title: 'Search'
    }
  })
  .state('show', {
    url: '/show/:id',
    templateUrl: 'partials/showModule.html',
    controller: 'ShowModuleCtrl',
    resolve: {
      auth: resolveAuth
    }
  })
  .state('show.slug', {
    url: '/:slug'
  })
  .state('create', {
    url: '/create',
    templateUrl: 'partials/createModule.html',
    controller: 'CreateCtrl',
    resolve: {
      auth: resolveAuth
    },
    data: {
      title: 'Upload Module'
    }
  })
  .state('browse', {
    url: '/browse',
    templateUrl: 'partials/browse.html',
    controller: 'ListModulesCtrl',
    resolve: {
      auth: resolveAuth
    },
    data: {
      title: 'Recently Update Modules'
    }
  })
  .state('browse.page', {
    url: '/:page'
  });

  // Direct empty routes to the search state
  $urlRouterProvider.when('/', function($state) {
    $state.go('search', null, {location : false});
  });

}).
run(function($rootScope, editableOptions, Restangular, Alert,
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


  $rootScope.$on('$stateChangeSuccess', function(evt, state) {
    $rootScope.title = state.data ? state.data.title : null;
    $rootScope.controller = state.controller;
  });

});
