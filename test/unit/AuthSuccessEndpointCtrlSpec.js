describe('AuthSuccessEndpointCtrl', function() {
  beforeEach(module('modulusOne.authSuccessEndpoint'));

  describe('#getOAuthToken', function() {
    it('should output an object with any url-params passed',
      inject(function($controller, UserAuth) {

      var url = "http://example.com/#access_token=ada95902-06c7-4335-8ff0-0dec3b0538cf&token_type=bearer&expires_in=43200&scope=";
      var $scope = {};
      var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope});

      var token = $scope.getOAuthToken(url);

      expect(token).toBeTruthy();
      expect(token.accessToken).toBe('ada95902-06c7-4335-8ff0-0dec3b0538cf');
      expect(token.tokenType).toBe('bearer');
      expect(token.expireTime).toBeCloseTo(Date.now() + 43200 * 1000, -2);
      expect(token.constructor).toBe(UserAuth);

    }));

    it('should work with a URL with a "#/" in the hash',
      inject(function($controller, UserAuth) {

        var url = 'http://localhost:8083/auth-success.html#/access_token=ada95902-06c7-4335-8ff0-0dec3b0538cf&token_type=bearer&expires_in=33705&scope=';
        var $scope = {};
        var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope});

        var token = $scope.getOAuthToken(url);

        expect(token.constructor).toBe(UserAuth);
        expect(token.isValid()).toBe(true);
        expect(token.accessToken).toBe('ada95902-06c7-4335-8ff0-0dec3b0538cf');
      }))

  });

  describe('#storeToken', function() {
    it('should place token in local storage',
      inject(function($controller, UserAuth) {

        var token = new UserAuth('64142E97-E1FE-4B48-8572-1FE181980D54',
          'bearer', 3600, 'foobarscope');
        var storage = {};
        var $scope = {};

        var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope,
          $localStorage: storage});

        var result = $scope.storeToken(token);

        expect(result).toBe(true);
        expect(storage.authToken).toBe(token);

      }));

    it('should return false when passed an invalid token',
      inject(function($controller, UserAuth) {

        var $scope = {};

        var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope});

        var result = $scope.storeToken(new UserAuth());

        expect(result).toBe(false);
      }));
  })

  describe('#exitEndpoint', function() {

    it('should close itself if it\'s a popup', inject(function($controller) {

      var $scope = {};
      var $window = {opener: {window: 'yep'}, close: function() {}};

      spyOn($window, 'close');

      var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope,
        $window: $window});

      $scope.exitEndpoint()

      expect($window.close).toHaveBeenCalled();


    }));

    it('should redirect to the main app if it\'s a standard window', inject(
      function($controller, $location) {

        var $scope = {};
        var $window = {location: undefined}

        var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope,
          $window: $window});

        $scope.exitEndpoint();

        expect($window.location).toBe('/');

      }));
  });
})