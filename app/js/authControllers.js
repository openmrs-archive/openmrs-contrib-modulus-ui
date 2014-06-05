angular.module('modulusOne.authControllers', [
    'LocalStorageModule',
    'modulusOne.authServices'
  ])
  .controller('AuthCtrl', function(
      $scope,
      $window,
      AuthService,
      Config,
      Uri,
      localStorageService,
      Restangular,
      UserAuth
    ) {

    /**
     * Opens a popup containing the determined OAuth authorization URL.
     * @return {undefined}
     */
    $scope.login = function () {

      function PopupCenter(url, title, w, h) {
          // Fixes dual-screen position                         Most browsers      Firefox
          var dualScreenLeft = $window.screenLeft != undefined ? $window.screenLeft : screen.left;
          var dualScreenTop = $window.screenTop != undefined ? $window.screenTop : screen.top;

          width = $window.innerWidth ? $window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
          height = $window.innerHeight ? $window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

          var left = ((width / 2) - (w / 2)) + dualScreenLeft;
          var top = ((height / 2) - (h / 2)) + dualScreenTop;
          var newWindow = $window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

          // Puts focus on the newWindow
          if ($window.focus) {
              newWindow.focus();
          }
      }

      PopupCenter(AuthService.buildAuthUrl(), 'modulusOAuthLogin', 600, 650);
    }

    /**
     * Tells the AuthService to logout, opening a logout alert upon completion.
     * @return {undefined}
     */
    $scope.logout = function logout() {
      AuthService.doLogout();
    };

    /**
     * Called by ng-init upon page load. Looks for a token from local storage
     * and attempts to log in with that token.
     * @return {undefined}
     */
    $scope.init = function init() {
      // Attempt to load an authentication token at startup
      var token = localStorageService.get('modulus-authToken');
      $scope.loggedIn = AuthService.doLogin(token);
    };

    $scope.$watch(function watchUser() {
      return AuthService.user;
    }, function setUser(user) {
      $scope.user = user;
    });

    $scope.$watch(function watchLoggedIn() {
      return AuthService.loggedIn;
    }, function setLoggedIn(loggedIn) {
      $scope.loggedIn = loggedIn;
    });

  })