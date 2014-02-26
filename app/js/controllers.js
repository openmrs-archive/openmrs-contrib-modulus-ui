/* Controllers */

angular.module('modulusOne.controllers', [])

  .controller('ShowModuleCtrl', function($scope, Restangular, $routeParams) {

    Restangular.one('modules', $routeParams.id).get()
    .then(function(module) {
      $scope.module = module

      var latestReleaseId = module.releases.length
      return module.one('releases', latestReleaseId).get()
    })
    .then(function(release){
      $scope.latestRelease = release
    })


    // Editability
    $scope.editable = false
    $scope.toggleEdit = function() {
      $scope.editable = Boolean(1 - $scope.editable)
    }


  })

  .controller('ListModulesCtrl', function($scope, Restangular, isCompleted) {

      Restangular.all('modules').getList({max: 100})
      .then(function(modules) {
        $scope.modules = _.filter(modules, isCompleted)
        console.log($scope.modules)
      })


  })

  .controller('AlertCtrl', function($scope) {

  })

