angular.module('modulusOne.authServices', [
    'LocalStorageModule',
    'modulusOne.services'
  ])
  .factory('UserAuth', function() {
    var UserAuth = function UserAuth(accessToken, tokenType, expiresIn, scope) {

      // Support creating a UserAuth from a JSON object
      if (typeof accessToken === 'object') {
        var props = angular.copy(accessToken);
        this.accessToken = props.accessToken;
        this.tokenType = props.tokenType;
        this.expireTime = new Date(props.expireTime);
        this.scope = props.scope;
      } else {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expireTime = new Date(Date.now() + expiresIn * 1000);
        this.scope = scope;
      }

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
  .factory('AuthService', function(
      Uri,
      Config,
      UserAuth,
      Restangular,
      localStorageService,
      $q
    ) {

    var AuthService = {
      user: undefined,
      loggedIn: undefined
    };

    /**
     * Generate a url for OAuth authorization based on configuration in the
     * application's config file.
     * @return {String} URL to begin OAuth authorization
     */
    AuthService.buildAuthUrl = function buildAuthUrl() {
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
     * @return {Promise|null} promise that will be resolved after login data
     * has been set
     */
    AuthService.doLogin = function doLogin(token) {

      if (token && token.constructor !== UserAuth) {
        token = new UserAuth(token);
      }

      // If a valid token, set all restangular requests to use it
      if (token && token.isValid()) {
        localStorageService.set('modulus-authToken', token);
        Restangular.setDefaultHeaders({
          'Authorization': 'Bearer ' + token.accessToken
        });
      } else {
        AuthService.doLogout();
        return authResolver.resolve();
      }

      return Restangular.one('users', 'current').get()
      .then(function success(user) {
        // console.debug('success', user);
        AuthService.user = user;
        AuthService.loggedIn = true;

        return user;

      }, function error(err) {
        if (err.status === 401) { // Log out, due to expired / invalid token
          AuthService.logout();
        }
      })
      .finally(function() {
        return authResolver.resolve();
      });
    };

    /**
     * Deletes the authToken in localStorage, sets `loggedIn` to false, and
     * removes the user's profile from memory.
     * @return {boolean}
     */
    AuthService.doLogout = function doLogout() {
      localStorageService.remove('modulus-authToken');
      AuthService.loggedIn = false;
      AuthService.user = undefined;

      return true;
    };

    var authResolver = $q.defer();

    /**
     * A promise that will be called once authentication status is determined,
     * e.g. when doLogin() has completed.
     * @type {Promise}
     */
    AuthService.waitUntilLoaded = authResolver.promise;

    return AuthService;

  });