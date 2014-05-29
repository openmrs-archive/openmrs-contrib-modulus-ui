describe('AuthCtrl', function() {
  beforeEach(module('modulusOne.authControllers'));

  var config = {
    api: {
      baseUrl: 'http://server.local'
    },
    appUrl: 'http://client.local',
    auth: {
      authenticateUrl: 'http://example.com/authenticate',
      clientId: 'foobar123'
    }
  };

  describe('#login', function() {

    xit("should open a popup to Modulus API's OAuth endpoint",
      inject(function($controller) {

        var $scope = {};
        var $window = {open: function(){}};

        spyOn($window, 'open');

        var ac = $controller('AuthCtrl', {$scope: $scope, $window: $window,
          Config: config});

        $scope.login();

        expect($window.open).toHaveBeenCalled();
        expect($window.open.mostRecentCall.args[0]).toBe(
          'http://example.com/authenticate?response_type=token&client_id=8fa0753531217077ab449c37a4d0bd5b&redirect_uri=http://localhost:8083/auth-success.html')


    }));

  })

  describe('#buildAuthUrl', function() {
    it("should generate an authorization url from based on auth configuration",
      inject(function($controller, $location) {

        var $scope = {};

        var ac = $controller('AuthCtrl', {$scope: $scope, Config: config});

        var url = $scope.buildAuthUrl();

        $location.url(url);
        expect($location.search('client_id')).toBe('foobar123');
        expect($location.search('redirect_uri')).toBe(config.appUrl +
          '/auth-success.html');
        expect($location.search('response_type')).toBe('token');

      }));
  })
})