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
  'modulusOne.routeSecurity',
  'modulusOne.progressService',
  'xeditable',
  'angularFileUpload',
  'ui.bootstrap',
  'ui.router'
]).
config(function($stateProvider, $urlRouterProvider, RestangularProvider,
$locationProvider) {

  function resolveAuth(AuthService) {
    return AuthService.waitUntilLoaded;
  }

  function getModule($stateParams, Restangular, $rootScope) {
    return Restangular.one('modules', $stateParams.id).get()
  }

  $stateProvider
  .state('home', {
    url: '/',
    controller: function($state) {
      $state.go('search', null, {location: 'replace'});
    }
  })
  .state('search', {
    url: '/search',
    templateUrl: 'partials/search.html',
    controller: 'SearchCtrl',
    resolve: {
      auth: resolveAuth
    },
    data: {
      title: 'Search'
    }
  })
  .state('show', {
    url: '/show/:id/:slug',
    resolve: {
      auth: resolveAuth,
      module: getModule
    },

    views: {
      '': {
        templateUrl: 'partials/showModule.html',
        controller: 'ShowModuleCtrl',
      },
      'release@show': {
        templateUrl: 'partials/showModuleReleases.html'
      }
    }
  })
  .state('show.newRelease', {
    url: '/new',
    views: {
      'release': {
        controller: 'NewReleaseCtrl',
        templateUrl: 'partials/showModuleNewRelease.html'
      }
    },
    data: {
      requiredRole: 'ROLE_USER'
    }
  })
  .state('redirectToShow', {
    url: '/show/:id',
    controller: 'RedirectToShowModuleCtrl'
  })
  .state('create', {
    url: '/create',
    templateUrl: 'partials/createModule.html',
    controller: 'CreateCtrl',
    resolve: {
      auth: resolveAuth
    },
    data: {
      title: 'Upload Module',
      requiredRole: 'ROLE_USER'
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

  // Direct empty routes to the home state
  $urlRouterProvider.when('', '/');
}).

run(function($rootScope, editableOptions, Restangular, $state, Alert,
  prepareModule, Config, AuthService, $location, $stateParams,
  checkAuthorization, ProgressBar) {

  editableOptions.theme = 'bs3'

  $rootScope.Config = Config

  ProgressBar.bootstrap();

  Restangular.setBaseUrl(Config.api.baseUrl + '/api' ||
    '/api')

  var apiError = new Alert('danger', 'Uh oh! Error communicating with the Modulus server.')
  Restangular.setErrorInterceptor(function(response, promise) {

    // Log out if the token has expired.
    if (response.status === 401 && response.data.error === "invalid_token") {
      console.log('Logging out due to invalid_token');

      // Open an alert only if the invalidation occured during usage.
      if ($state.current) { // Returns false when the app is initially loading.
        new Alert('info', 'Your authentication token became invalid and you ' +
          'have been logged out.').open();
      }

      AuthService.doLogout();
      reloadState();
      return promise.reject(response);
    }

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
  });

  $rootScope.$on('$stateChangeStart', checkAuthorization);

  $rootScope.$on('$stateChangeSuccess', function(evt, state) {
    $rootScope.title = state.data ? state.data.title : null;
    $rootScope.controller = state.controller;
  });

  // When logged-in status changes, reload the route.
  $rootScope.$watch(function() {
    return AuthService.loggedIn;
  }, function(current, former) {

    // true if `loggedIn` changed from true->false or false->true
    if (current + former == 1) { reloadState(); }
  });

  /**
   * Reload the current state of the application, which re-initializes the
   * controller.
   * @return {undefined}
   */
  function reloadState() {
    // $state.reload();

    // $state.reload() is broken in current builds of ui-router, so we do the
    // same thing manually:
    $state.transitionTo(
      $state.current.name || 'home',
      angular.copy($stateParams, checkAuthorization),
      {reload: true, inherit: true, notify: true }
    );
  }

});
