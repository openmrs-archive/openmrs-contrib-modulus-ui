angular.module('modulusOne.authControllers', [])
  .controller('AuthCtrl', function($scope, $window, Config) {


    $scope.login = function () {
      $window.open('http://google.com', 'modulusOAuthLogin',
        'width=650,height=550,left=300,top=100');
    }

    $scope.buildAuthUrl = function buildAuthUrl() {
      var url = Config.auth.authenticateUrl;
      var params = [
        'client_id=' + Config.auth.clientId,
        'response_type=' + 'token',
        'redirect_uri=' + Config.appUrl
      ];

      return url + '/?' + params.join('&');
    };

  })