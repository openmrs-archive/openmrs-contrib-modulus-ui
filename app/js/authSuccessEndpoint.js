angular.module('modulusOne.authSuccessEndpoint', [
    'LocalStorageModule',
    'modulusOne.services',
    'modulusOne.authServices',
    'modulusOne.config',
    'restangular'
  ])
  .controller('AuthSuccessEndpointCtrl', function($scope, localStorageService,
  $location, UserAuth, $window, $timeout, AuthService) {

    /**
     * Generate a UserAuth token from a url with OAuth callback parameters in it.
     * @param  {string} absUrl URL with OAuth callback params
     * @return {UserAuth}      Token corresponding to the given URL
     */
    $scope.getOAuthToken = function getOAuthToken(absUrl) {
      var paramPartOfURL = absUrl.slice(absUrl.indexOf('#') + 1);

      // Remove a forward slash that angular adds if it tries to re-route.
      if (paramPartOfURL.charAt(0) === '/') {
        paramPartOfURL = paramPartOfURL.slice(1);
      }

      var paramStrings = paramPartOfURL.split('&');
      var params = {};
      paramStrings.forEach(function(p) {
        var split = p.split('=');
        params[split[0]] = split[1];
      })

      return new UserAuth(params.access_token, params.token_type,
        params.expires_in, params.scope);
    };

    $scope.init = function init() {
      var token = $scope.getOAuthToken($location.absUrl());

      if ($window.opener) {

        var parent = $window.opener;
        var injector = parent.angular.element(parent.document).injector();
        var parentAuthService = injector.get('AuthService');
        parentAuthService.doLogin(token)
        .then(function() {
          $scope.success = true;
          $window.close();
        }, function() {
          $scope.success = false;
        });

      } else {

        AuthService.doLogin(token)
        .then(function () {
          $scope.success = true;
          $window.location = '/';
        }, function() {
          $scope.success = false;
        });

      }


    };

  });