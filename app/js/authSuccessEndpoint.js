angular.module('modulusOne.authSuccessEndpoint', [
    'ngStorage'
  ])
  .factory('UserAuth', function() {
    var UserAuth = function UserAuth(accessToken, tokenType, expiresIn, scope) {

      this.accessToken = accessToken;
      this.tokenType = tokenType;
      this.expireTime = Date.now() + expiresIn * 1000;
      this.scope = scope;

      return this;
    };

    UserAuth.prototype.isValid = function() {
      if (this.accessToken && this.tokenType && this.expireTime) {
        return true;
      } else {
        return false;
      }
    };

    return UserAuth;
  })
  .controller('AuthSuccessEndpointCtrl', function($scope, $localStorage,
  $location, UserAuth, $window) {

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
        $localStorage.authToken = token;
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
      $scope.exitEndpoint();
    } else {
      $scope.success = false;
    }

  });