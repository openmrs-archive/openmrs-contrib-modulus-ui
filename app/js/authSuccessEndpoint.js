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

    /**
     * Leave the success endpoint. If the window is a popup, close the popup.
     * If the window is a standard page, redirect to the main application.
     * @return {[type]} [description]
     */
    $scope.exitEndpoint = function exitEndpoint() {
      if ($window.opener) {
        $window.opener.location.reload(false); // reload the parent page
        $window.close();
      } else {
        $window.location = '/';
      }
    }

    $scope.init = function init() {
      var token = $scope.getOAuthToken($location.absUrl());

      AuthService.doLogin(token)
      .then(function () {
        $scope.success = true;
        $scope.exitEndpoint();
      }, function() {
        $scope.success = false;
      });
    };

  });