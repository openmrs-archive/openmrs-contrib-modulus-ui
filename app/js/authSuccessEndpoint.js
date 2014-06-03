angular.module('modulusOne.authSuccessEndpoint', [
    'LocalStorageModule',
    'modulusOne.services'
  ])
  .controller('AuthSuccessEndpointCtrl', function($scope, localStorageService,
  $location, UserAuth, $window, $timeout) {

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
     * Place a token into the browser's local storage.
     * @param  {UserAuth} token A token to store.
     * @return {boolean}        Whether the token was valid and stored.
     */
    $scope.storeToken = function storeToken(token) {
      if (token.isValid()) {
        localStorageService.set('modulus-authToken', token);

        // Broadcast event to parent window if the endpoint is open in a popup.
        if ($window.opener) {
          var parentApp = $window.opener.angular.element($window.opener.document);
          parentApp.scope().$broadcast('obtainedAuthToken', token);
        }

        return true;
      } else {
        return false;
      }
    }

    /**
     * Leave the success endpoint. If the window is a popup, close the popup.
     * If the window is a standard page, redirect to the main application.
     * @return {[type]} [description]
     */
    $scope.exitEndpoint = function exitEndpoint() {
      if ($window.opener) {
        $window.close();
      } else {
        $window.location = '/';
      }
    }

    var token = $scope.getOAuthToken($location.absUrl());

    if ($scope.storeToken(token)) {
      $scope.success = true;
      $timeout($scope.exitEndpoint, 1000);
    } else {
      $scope.success = false;
    }

  });