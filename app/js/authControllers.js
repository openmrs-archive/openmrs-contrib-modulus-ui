angular.module('modulusOne.authControllers', [
    'LocalStorageModule'
  ])
  .controller('AuthCtrl', function($scope, $window, Config, Uri,
    localStorageService, Restangular, UserAuth, $rootScope, Alert) {

    // Initialize values
    $scope.user = $scope.user || {};
    $scope.loggedIn = undefined;

    var loginAlert;
    var logoutAlert;

    /**
     * Opens a popup containing the determined OAuth authorization URL.
     * @return {undefined}
     */
    $scope.login = function () {
      $window.open($scope.buildAuthUrl(), 'modulusOAuthLogin',
        'width=650,height=600,left=300,top=100,scrollbars=yes');
    }

    /**
     * Generate a url for OAuth authorization based on configuration in the
     * application's config file.
     * @return {String} URL to begin OAuth authorization
     */
    $scope.buildAuthUrl = function buildAuthUrl() {
      var uri = new Uri(Config.auth.authenticateUrl);
      var params = [
        'client_id=' + Config.auth.clientId,
        'response_type=' + 'token',
        'redirect_uri=' + Config.appUrl + '/auth-success.html'
      ];

      // Add any pre-existing query arguments
      if (uri.query()) {
        params.unshift(uri.query());
      }

      uri.setQuery(params.join('&'));

      return uri.toString();
    };

    /**
     * Complete a login flow, using a valid token to obtain the user's profile
     * and setting `loggedIn` to `true`.
     * @param  {UserAuth} token authorization token
     * @return {boolean}  whether the token was valid and login was completed
     */
    $scope.updateAuthStatus = function updateAuthStatus(token) {
      if (!token) return false;

      if (token.constructor !== UserAuth) {
        token = new UserAuth(token);
      }

      // If a valid token, set all restangular requests to use it
      if (token.isValid()) {
        Restangular.setDefaultHeaders({
          'Authorization': 'Bearer ' + token.accessToken
        });
      } else {
        return false;
      }

      Restangular.one('users', 'current').get()
      .then(function(user) {
        $scope.user = user;
        $scope.loggedIn = true;

        if (logoutAlert) {
          logoutAlert.close();
        }

        loginAlert = new Alert('success', 'You have been logged in. Welcome!')
          .open();
      });

      return true;
    };

    /**
     * Deletes the authToken in localStorage, sets `loggedIn` to false, and
     * removes the user's profile from memory.
     * @return {boolean}
     */
    $scope.logout = function logout() {
      localStorageService.remove('modulus-authToken');
      $scope.loggedIn = false;
      delete $scope.user;

      if (loginAlert) {
        loginAlert.close();
      }

      logoutAlert = new Alert('info', 'You have been logged out.').open();
      return true;
    };

    $scope.init = function init() {
      // Attempt to load an authentication token at startup
      var token = localStorageService.get('modulus-authToken');
      $scope.loggedIn = $scope.updateAuthStatus(token);

      $scope.bindEvents();
    };

    $scope.bindEvents = function bindEvents() {
      // Bind events
      $scope.$on('obtainedAuthToken', function(event, token) {
        $scope.updateAuthStatus(token);
      });

      $scope.$watch('user', function(user) {
        $rootScope.user = user;
      });

      $scope.$watch('loggedIn', function(loggedIn) {
        $rootScope.loggedIn = loggedIn;
      });
    };

  })