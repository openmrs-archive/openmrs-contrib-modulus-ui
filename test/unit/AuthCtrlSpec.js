describe('AuthCtrl', function() {

  var $scope;
  var $window;
  var ac;
  var storage;
  var Restangular;
  var UserAuth;
  var Alert;
  var AuthService;
  var config;
  var Uri;

  beforeEach(module('modulusOne.authControllers'));

  beforeEach(angular.mock.module("restangular"));
  beforeEach(angular.mock.module('modulusOne.services'));

  beforeEach(inject(function($controller, $injector) {
    $scope = $injector.get('$rootScope');
    $window = {open: function(){}, location: {reload: function() {}}};
    storage = {set: function() {}, get: function() {}, remove: function() {}};
    Restangular = $injector.get('Restangular');
    UserAuth = $injector.get('UserAuth');
    Alert = $injector.get('Alert');
    AuthService = $injector.get('AuthService');
    config = $injector.get('Config');
    Uri = $injector.get('Uri');

    spyOn($window, 'open');
    Restangular.setBaseUrl(config.api.baseUrl + '/api');

  }));

  describe('#login', function() {

    beforeEach(inject(function($controller) {
      ac = $controller('AuthCtrl', {
        $scope: $scope,
        $window: $window,
        Config: config,
        Uri: Uri,
      });
    }));

    it("should open a popup to Modulus API's OAuth endpoint", function() {

      $scope.login();

      expect($window.open).toHaveBeenCalled();

    });

    it('should open a popup named "modulusOAuthLogin"', function() {

      $scope.login();
      expect($window.open.calls.argsFor(0)[1]).toBe('modulusOAuthLogin');

    });

  });

  describe('#logout', function() {

    var token;
    var openAlert;

    beforeEach(inject(function($controller) {
      token = new UserAuth("ada95902-06c7-4335-8ff0-0dec3b0538cf",
        "bearer", 60 * 60);
      $scope.user = {id: 1, username: 'horatio', fullname: 'Horatio Hornblower'};
      $scope.loggedIn = true;

      spyOn(storage, 'get').and.returnValue(JSON.parse(JSON.stringify(token)));

      ac = $controller('AuthCtrl', {
        $scope: $scope,
        localStorageService: storage,
        Config: config,
        $window: $window
      });
    }));

    it('should call AuthService#doLogout', function() {
      spyOn(AuthService, 'doLogout');

      $scope.logout();
      expect(AuthService.doLogout).toHaveBeenCalled();
    })

    it('should reload the page', function() {
      spyOn($window.location, 'reload');

      $scope.logout();
      expect($window.location.reload).toHaveBeenCalled();
    });
  });

});