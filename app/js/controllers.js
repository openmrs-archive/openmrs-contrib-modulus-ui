/* Controllers */

angular.module('modulusOne.controllers', [])

  .controller('ShowModuleCtrl', function($scope, Restangular, $routeParams, $location) {

    Restangular.one('modules', $routeParams.id).get()
    .then(function(module) {
      $scope.module = module

      return module.all('releases').getList()
    })
    .then(function(releases){
      console.debug(releases)
      $scope.latestRelease = releases[releases.length - 1]
      $scope.module.releases = releases
    })



    // Editability
    $scope.editable = false
    $scope.toggleEdit = function() {
      $scope.editable = Boolean(1 - $scope.editable)
    }


    $scope.confirmDeleteModule = function() {
      if (confirm('"' + $scope.module.name + '" will be deleted.')) {

        $scope.module.remove()
        .finally(function() {
          $location.path('/')
        })
      }
    }

  })

  .controller('ListModulesCtrl', function($scope, Restangular, isCompleted) {

      Restangular.all('modules').getList({max: 100})
      .then(function(modules) {
        $scope.modules = _.filter(modules, isCompleted)
      })


  })

  .controller('AlertCtrl', function($scope) {

  })

