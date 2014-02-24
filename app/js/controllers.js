'use strict';

/* Controllers */

angular.module('modulusOne.controllers', [])

  .controller('ShowModuleCtrl', ['$scope', 'ModuleService', '$routeParams',
    'MessageService', 'ReleaseService',
    function($scope, Module, $routeParams, MessageService, ReleaseService) {

    // Look up this module
    var module = $scope.module = Module.get({id: $routeParams.id}, function() {
      console.log(module)

      for (var k in module) {
        $scope[k] = module[k]
      }

      $scope.latest = ReleaseService.get({id: module.releases[0].id,
        moduleId: module.id}, function() {
          console.log($scope.latest)
        })

      MessageService.publish('breadcrumb', [
        {name: 'All Modules', url: '#/'},
        {name: module.name, url: '#/show/'+module.slug}
      ])
    })

    // Editability
    $scope.editable = false
    $scope.toggleEdit = function() {
      $scope.editable = Boolean(1 - $scope.editable)
    }


  }])

  .controller('ListModulesCtrl', ['$scope', 'ModuleService', 'MessageService',
    function($scope, ModuleService, MessageService) {

      var modules = ModuleService.list(function() {
        $scope.modules = modules
      })

      MessageService.publish('breadcrumb', [
        {name: 'All Modules', url: '#/'}
      ])
  }])

  .controller('AlertCtrl', function($scope) {

  })

