describe('AuthCtrl', function() {

  var $scope;
  var $window;
  var ac;
  var storage;
  var Restangular;
  var UserAuth;
  var Alert;

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

  beforeEach(module(
    'modulusOne.authControllers',
    function($provide) {
      $provide.value('Uri', window.Uri);
    }
  ));

  beforeEach(angular.mock.module("restangular"));
  beforeEach(angular.mock.module('modulusOne.services'));

  beforeEach(inject(function($controller, $injector) {
    $scope = $injector.get('$rootScope');
    $window = {open: function(){}};
    storage = {set: function() {}, get: function() {}, remove: function() {}};
    Restangular = $injector.get('Restangular');
    UserAuth = $injector.get('UserAuth');
    Alert = $injector.get('Alert');

    spyOn($window, 'open');
    Restangular.setBaseUrl(config.api.baseUrl + '/api');

  }));

  describe('#login', function() {

    beforeEach(inject(function($controller) {
      ac = $controller('AuthCtrl', {
        $scope: $scope,
        $window: $window,
        Config: config,
        Uri: window.Uri,
      });
    }));

    it("should open a popup to Modulus API's OAuth endpoint", function() {

      $scope.login();

      expect($window.open).toHaveBeenCalled();

    });

    it('should open a popup named "modulusOAuthLogin"', function() {

      $scope.login();
      expect($window.open.mostRecentCall.args[1]).toBe('modulusOAuthLogin');

    });

  });

  describe('#buildAuthUrl', function() {

    beforeEach(inject(function($controller) {
      ac = $controller('AuthCtrl', {
        $scope: $scope,
        Config: config,
        Uri: window.Uri,
      });
    }));

    it("should generate an authorization url from based on auth configuration",
      inject(function($controller, Uri) {

        var urlString = $scope.buildAuthUrl();
        var url = new Uri($scope.buildAuthUrl());

        expect(typeof urlString).toBe('string');
        expect(url.getQueryParamValue('client_id')).toBe('foobar123');
        expect(url.getQueryParamValue('redirect_uri')).toBe(config.appUrl +
          '/auth-success.html');
        expect(url.getQueryParamValue('response_type')).toBe('token');

      }));
  });

  describe('#updateAuthStatus', function() {

    var $httpBackend;
    var user;
    var rootScope;
    var token;
    var openAlert;

    beforeEach(inject(function($controller, $injector) {
      $httpBackend = $injector.get('$httpBackend');
      user = {id: 1, username: 'horatio', fullname: 'Horatio Hornblower'};
      rootScope = {};

      openAlert = jasmine.createSpy();
      Alert = jasmine.createSpy().andReturn({
        open: openAlert
      });

      token = new UserAuth("ada95902-06c7-4335-8ff0-0dec3b0538cf",
        "bearer", 60 * 60);

      ac = $controller('AuthCtrl', {
        $scope: $scope,
        Config: config,
        Restangular: Restangular,
        UserAuth: UserAuth,
        $rootScope: rootScope,
        Alert: Alert
      });

    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call /api/users/current with an access token', function() {
      $httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(user);

      $httpBackend.expect(
        'GET',
        'http://server.local/api/users/current',
        null,
        function checkHeaders(headers) {
          return headers.Authorization &&
            headers.Authorization === 'Bearer ' + token.accessToken;
        }
      );

      var result = $scope.updateAuthStatus(token);
      expect(result).toBe(true);

      $httpBackend.flush();
    });

    it('should set `user` to the current user profile',
    function() {
      $httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(user);

      var result = $scope.updateAuthStatus(token);
      expect(result).toBe(true);

      $httpBackend.flush();

      expect($scope.user.id).toBe(1);
      expect($scope.user.fullname).toBe('Horatio Hornblower');
      expect($scope.user.username).toBe('horatio');
    });

    it('should set `loggedIn` to true', function() {
      $httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(user);

      var result = $scope.updateAuthStatus(token);
      expect(result).toBe(true);

      $httpBackend.flush();

      expect($scope.loggedIn).toBe(true);
    });

    it('should copy `user` and `loggedIn` properties to rootScope', function() {
      $httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(user);

      $scope.bindEvents();
      var result = $scope.updateAuthStatus(token);
      expect(result).toBe(true);

      $httpBackend.flush();

      expect(rootScope.user).toBe($scope.user);
      expect(rootScope.loggedIn).toBe($scope.loggedIn);
    });

    it('should log out if it gets a 401 Unauthorized error', function() {
      $httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(401, '');

      spyOn($scope, 'logout');

      $scope.updateAuthStatus(token);
      $httpBackend.flush();

      expect($scope.logout).toHaveBeenCalled();
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

      spyOn(storage, 'get').andReturn(JSON.parse(JSON.stringify(token)));

      openAlert = jasmine.createSpy()
      Alert = jasmine.createSpy().andReturn({
        open: openAlert
      });

      ac = $controller('AuthCtrl', {
        $scope: $scope,
        localStorageService: storage,
        Config: config,
        Alert: Alert
      });
    }));

    it('should delete the auth token from localStorage', function() {
      spyOn(storage, 'remove');

      $scope.logout();

      expect(storage.remove).toHaveBeenCalledWith('modulus-authToken');
    });

    it('should set `loggedIn` to false', function() {
      $scope.logout();
      expect($scope.loggedIn).toBe(false);
    });

    it('should remove `user` from scope', function() {
      $scope.logout();
      expect($scope.user).toBe(undefined);
    });

    it('should display logout alert', function() {
      $scope.logout();

      expect(Alert).toHaveBeenCalledWith('info',
        'You have been logged out.');
      expect(openAlert).toHaveBeenCalled();
    });
  });
});