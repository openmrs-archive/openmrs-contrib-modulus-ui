describe('AuthSuccessEndpointCtrl', function() {
  beforeEach(function() {
    module('modulusOne.authSuccessEndpoint');
    angular.mock.module('modulusOne.authServices');
  });

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

  describe('#init', function() {

    var q;
    var AuthService;
    var rootScope;

    beforeEach(function() {
      inject(function(UserAuth, _$q_, _AuthService_, $rootScope) {
        this.token = new UserAuth('ada95902-06c7-4335-8ff0-0dec3b0538cf',
          'bearer', 1234);
        q = _$q_;
        AuthService = _AuthService_;
        rootScope = $rootScope;
      });
    });

    it('should call the parent\'s AuthService and close itself if it\'s a popup',
    inject(function($controller) {

      var $scope = rootScope;
      var defer = q.defer();

      var injector = jasmine.createSpy().and.returnValue({
        get: jasmine.createSpy().and.returnValue(AuthService)
      });
      var element = jasmine.createSpy().and.returnValue({
        injector: injector
      });

      var $window = {
        opener: {
          location: { reload: jasmine.createSpy() },
          angular: {
            element: element
          }
        },
        close: function() {}
      };


      var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope,
        $window: $window, AuthService: AuthService});

      spyOn($scope, 'getOAuthToken').and.returnValue(this.token);
      spyOn($window, 'close');
      spyOn(AuthService, 'doLogin').and.returnValue(defer.promise);

      $scope.init();
      defer.resolve();
      $scope.$apply();

      expect($scope.success).toBe(true);
      expect($window.close).toHaveBeenCalled();
      expect(AuthService.doLogin).toHaveBeenCalled();


    }));

    it('should call doLogin and redirect to the main app if it\'s a standard window',
    inject(function($controller, $location) {

      var $scope = rootScope;
      var $window = {location: undefined};
      var defer = q.defer();

      var asec = $controller('AuthSuccessEndpointCtrl', {$scope: $scope,
        $window: $window, AuthService: AuthService});

      spyOn(AuthService, 'doLogin').and.returnValue(defer.promise);

      $scope.init();
      defer.resolve();
      $scope.$apply();

      expect($window.location).toBe('/');

    }));
  });
})