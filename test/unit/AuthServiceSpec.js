describe('AuthService', function() {

  beforeEach(function() {
    module('modulusOne.authServices');

    angular.mock.module('restangular');
    angular.mock.module('LocalStorageModule');

    inject(function(Restangular, Config) {
      Restangular.setBaseUrl(Config.api.baseUrl + '/api');
    })
  });


  describe('#buildAuthUrl', function() {

    var Uri;
    var AuthService;

    beforeEach(function() {
      inject(function(_AuthService_, _Uri_) {
        AuthService = _AuthService_;
        Uri = _Uri_;
      });

    })

    it("should generate an authorization url from based on auth configuration",
      function() {

        var urlString = AuthService.buildAuthUrl();
        var url = new Uri(urlString);

        expect(typeof urlString).toBe('string');
        expect(url.getQueryParamValue('client_id')).toBe('foobar123');
        expect(url.getQueryParamValue('redirect_uri')).toBe(this.config.appUrl +
          '/auth-success.html');
        expect(url.getQueryParamValue('response_type')).toBe('token');

      });
  });

  describe('#doLogin', function() {

    var openAlert;

    var httpBackend;
    var AuthService;
    var UserAuth;
    var localStorageService;

    beforeEach(function() {
      inject(function(
        $httpBackend,
        _AuthService_,
        _UserAuth_,
        _localStorageService_
      ) {

        httpBackend = $httpBackend;
        AuthService = _AuthService_;
        UserAuth = _UserAuth_;
        localStorageService = _localStorageService_;
      });

      this.token = new UserAuth("ada95902-06c7-4335-8ff0-0dec3b0538cf",
        "bearer", 60 * 60);
      this.user = {id: 1, username: 'horatio', fullname: 'Horatio Hornblower'};
    });

    beforeEach(inject(function($controller, $injector) {

      openAlert = jasmine.createSpy();
      Alert = jasmine.createSpy().and.returnValue({
        open: openAlert
      });

    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should call /api/users/current with an access token', function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);

      var accessToken = this.token.accessToken;

      httpBackend.expect(
        'GET',
        'http://server.local/api/users/current',
        null,
        function checkHeaders(headers) {
          return headers.Authorization &&
            headers.Authorization === 'Bearer ' + accessToken;
        }
      );

      AuthService.doLogin(this.token);

      httpBackend.flush();
    });

    it('should set `user` to the current user profile', function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);

      AuthService.doLogin(this.token);

      httpBackend.flush();

      expect(AuthService.user.id).toBe(1);
      expect(AuthService.user.fullname).toBe('Horatio Hornblower');
      expect(AuthService.user.username).toBe('horatio');
    });

    it('should set `loggedIn` to true', function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);

      AuthService.doLogin(this.token);

      httpBackend.flush();

      expect(AuthService.loggedIn).toBe(true);
    });

    it('should return a promise that resolves after user data is loaded',
    function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);

      var promise = AuthService.doLogin(this.token);
      expect(typeof promise.then).toBe('function');

      var userId;
      promise.then(function(user) {
        userId = user.id;
      });

      httpBackend.flush();

      expect(userId).toBe(this.user.id);

    });

    it('should store a token in local storage', function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);
      spyOn(localStorageService, 'set');

      AuthService.doLogin(this.token);
      httpBackend.flush();

      expect(localStorageService.set).toHaveBeenCalledWith('modulus-authToken',
        this.token);
    });

    it('should resolve AuthService.waitUntilLoaded once finished', function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);

      var resolved;
      AuthService.waitUntilLoaded.then(function() {
        resolved = true;
      });

      AuthService.doLogin(this.token);
      httpBackend.flush();

      expect(resolved).toBe(true);
    });

  });

  describe('#doLogout', function() {

    var AuthService;
    var localStorageService;

    beforeEach(function() {

      inject(function(_AuthService_, _localStorageService_) {
        AuthService = _AuthService_;
        localStorageService = _localStorageService_;
      });
    });

    it('should delete the auth token from localStorage', function() {
      spyOn(localStorageService, 'remove');

      AuthService.doLogout();

      expect(localStorageService.remove).toHaveBeenCalledWith('modulus-authToken');
    });

    it('should set `loggedIn` to false', function() {
      AuthService.doLogout();
      expect(AuthService.loggedIn).toBe(false);
    });

    it('should remove `user` from scope', function() {
      AuthService.doLogout();
      expect(AuthService.user).toBe(undefined);
    });

  });

  xdescribe('waitUntilLoaded', function() {

    var AuthService;
    var httpBackend;

    beforeEach(function() {
      inject(function(_AuthService_, $httpBackend) {
        AuthService = _AuthService_;
        httpBackend = $httpBackend;
      });
    });

    it('should be deferred after doLogin has completed', function() {
      httpBackend.when('GET', 'http://server.local/api/users/current')
        .respond(this.user);

      AuthService.doLogin()

    });
  })

});