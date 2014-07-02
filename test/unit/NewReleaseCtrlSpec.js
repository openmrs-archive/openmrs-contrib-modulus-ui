describe('NewReleaseCtrl', function() {

  var nrc;
  var $controller;
  var AuthService;
  var $rootScope;

  beforeEach(function() {
    module('modulusOne.showControllers');
    angular.mock.module('restangular');
    angular.mock.module('modulusOne.authServices');
    angular.mock.module('ui.router');

    inject(function(Restangular, Config, _$controller_, _AuthService_,
    _$rootScope_) {

      $controller = _$controller_;
      AuthService = _AuthService_;
      $rootScope = _$rootScope_;

      Restangular.setBaseUrl(Config.api.baseUrl + '/api');
    });

  });


  describe('#createResources', function() {

    var $scope;

    var sampleRelease = {
      id: 1234,
      moduleVersion: 1.0,
      requiredOMRSVersion: 2.0
    };

    beforeEach(inject(function($q) {

      var deferred = $q.defer();
      deferred.resolve(sampleRelease);

      $scope = {
        module: {
          all: jasmine.createSpy('all').and.returnValue({
            post: jasmine.createSpy('post').and.returnValue(deferred.promise)
          })
        }
      }

      nrc = $controller('NewReleaseCtrl', {
        $scope: $scope
      });

    }));

    it('should create a new release and set it to $scope.release', function() {

      $scope.createResources();
      $rootScope.$apply();

      expect($scope.release).toBe(sampleRelease);

    });

  });


  describe('#completeUpload', function() {

    var $state;
    var $scope;
    var $filter;

    $state = jasmine.createSpyObj('$state', ['go']);

    $filter = jasmine.createSpy('filter').and.returnValue(true);

    beforeEach(inject(function($q) {

      var deferred = $q.defer();
      deferred.resolve();

      $scope = {
        release: {
          put: jasmine.createSpy('put').and.returnValue(deferred.promise)
        },
        module: {
          id: 123,
          slug: 'test-module'
        }
      };

      nrc = $controller('NewReleaseCtrl', {
        $state: $state,
        $scope: $scope,
        AuthService: AuthService
      });
    }));


    it('should change state to module detail view', function() {

      $scope.completeUpload();

      $rootScope.$apply();

      expect($scope.release.put).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalled();
      expect($state.go.calls.mostRecent().args[0]).toBe('show');

    });

  });


});