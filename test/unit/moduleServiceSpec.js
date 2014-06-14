'use strict';

describe('ModuleService', function() {

  var $httpBackend, ModuleService

  beforeEach(inject(function($injector) {

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', '/api/modules/1').respond({
      id: 1,
      name: 'Test Module',
      description: 'This modules works.'
    })

    ModuleService = $injector.get('modulusOne.services2')
    console.log(ModuleService)
  }))


  xit('should get a module specified', function( ModuleService) {

    console.log(ModuleService)

    $httpBackend.expectGET('/api/modules/1')
    var module = ModuleService.get(1)
    expect(module.id).toBe(1)
    $httpBackend.flush()
  })

  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
})