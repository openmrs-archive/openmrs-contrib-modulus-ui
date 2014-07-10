describe('DuplicateModuleLookupCtrl', function() {

  var dmlc;
  var $controller;
  var $scope;
  var $httpBackend;
  var Restangular;
  var Config;
  var url = 'http://server.local/api/search?complex=true&q=reporting';
  var response = {
    totalCount: 3,
    offset: 0,
    items: [
      {id: 1, name: 'Reporting'},
      {id: 2, name: 'Data Integrity'},
      {id: 3, name: 'Form Data Export'}
    ],
    suggestion: null
  };

  beforeEach(function() {
    module('modulusOne.createControllers');
    angular.mock.module('restangular');

    inject(function(_$controller_, _Restangular_, _Config_, _$rootScope_,
    _$httpBackend_) {
      $controller = _$controller_;
      $scope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      Restangular = _Restangular_;
      Config = _Config_;
    });

    Restangular.setBaseUrl(Config.api.baseUrl + '/api');

    dmlc = $controller('DuplicateModuleLookupCtrl', {
      $scope: $scope,
      Restangular: Restangular
    });

    $httpBackend.whenGET(url).respond(response);
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('#findSimilar', function() {

    it('should call the search API', function() {
      $httpBackend.expectGET(url);

      $scope.findSimilar('reporting');

      $httpBackend.flush();
    });

    it('should call #displayAlert if any similar modules are found', function() {
      $httpBackend.expectGET(url);
      spyOn($scope, 'displayAlert');

      $scope.findSimilar('reporting');
      $httpBackend.flush();
      $scope.$apply();

      expect($scope.displayAlert).toHaveBeenCalledWith(response.items);

    });

    it('should exclude $scope.module from the results', function() {
      $httpBackend.expectGET(url);
      $scope.module = response.items[2];
      spyOn($scope, 'displayAlert');

      $scope.findSimilar('reporting');
      $httpBackend.flush();
      $scope.$apply();

      var expectation = _.without(response.items, response.items[2]);
      expect($scope.displayAlert).toHaveBeenCalledWith(expectation);

    });

  });

  describe('#displayAlert', function() {

    it('should set $scope.duplicates', function() {

      $scope.displayAlert(response.items);

      expect($scope.duplicates).toBe(response.items);
    });

  });

  describe('#init', function() {

    it('should watch $scope.module.name', function() {
      spyOn($scope, 'findSimilar'); // called by the listener function

      $scope.init();

      $scope.module = null;
      $scope.$apply();

      $scope.module = {name: 'foobar'};
      $scope.$apply();

      expect($scope.findSimilar).toHaveBeenCalledWith('foobar');
    })

  });

});