angular.module('modulusOne.routeSecurity', [
  'ui.bootstrap', 'ui.router', 'modulusOne.authServices'
])
.factory('checkAuthorization', function($modal, $state, AuthService) {

  return function(event, toState, toStateParams, fromState, fromStateParams) {

    function proceed() {
      return true;
    }

    function needsLogin() {
      event.preventDefault();
      $modal.open({
        templateUrl: 'partials/loginRequired.html',
        resolve: {
          toState: function() { return toState },
          toStateParams: function() { return toStateParams }
        },
        controller: 'NeedsLoginDialogCtrl'
      });
      return false;
    }

    function unauthorized() {
      event.preventDefault();
      $modal.open({
        templateUrl: 'partials/unauthorized.html',
        controller: 'UnauthorizedDialogCtrl',
        resolve: {
          toState: function() { return toState },
          toStateParams: function() { return toStateParams }
        }
      });

      // Go to the homepage if there's no state currently shown (for example,
      // if the user enter this URL directly)
      if (fromState.name === '') {
        $state.transitionTo('home', null, {location: 'replace'});
      }

      return false;
    }

    if (toState.data && toState.data.requiredRole) {
      if (!AuthService.loggedIn) {
        return needsLogin();
      } else if (!_.contains(AuthService.user.roles, toState.data.requiredRole)) {
        return unauthorized();
      } else {
        return proceed();
      }
    } else {
      return proceed();
    }

    if (AuthService.loggedIn === undefined) {
      event.preventDefault();
      var transition = {toState: toState, toStateParams: toStateParams};
      AuthService.waitUntilLoaded.then(function() {
        if (checkAuthorization()) {
          $state.go(this.toState, this.toStateParams);
        }
      }.bind(transition));
    } else {
      return checkAuthorization();
    }

  };

})
.controller('NeedsLoginDialogCtrl', function($scope, $modalInstance, $state,
AuthService, toState, toStateParams, $timeout) {

  $scope.path = toState.url;
  $scope.close = function() {
    if (toState.data && toState.data.progressTask)
      toState.data.progressTask.reject();
    $modalInstance.close();
  }

  // Automatically proceed to the route once the users logs in.
  $scope.$watch(function() {
    return AuthService.loggedIn;
  }, function(loggedIn) {
    if (loggedIn) {
      $state.go(toState, toStateParams);

      // `$timeout` is used to pop the dismiss command to the end of the stack,
      // which prevents the scope from being destroyed mid-digest.
      $timeout(function() {
        $modalInstance.dismiss('logged in');
      });
    }
  });

})
.controller('UnauthorizedDialogCtrl', function($scope, $modalInstance, toState) {
  $scope.close = $modalInstance.close;
  $scope.path = toState.url;
  $scope.requiredRole = toState.data.requiredRole;
})

.filter('role', function role() {
  return function(roleName) {
    switch (roleName) {
      case "ROLE_USER":
        return "user";

      case "ROLE_ADMIN":
        return "admin";
    }
  }
})