/* Controllers */

angular.module('modulusOne.controllers', [])

  .controller('ShowModuleCtrl', function($scope, Restangular, $routeParams,
    $location, getModule) {

    getModule($scope, $routeParams.id)
    .then(function() {

      if ($routeParams.slug !== $scope.module.slug) {
        $location.path('/show/'+$scope.module.id+'/'+$scope.module.slug)
      }
    })
    .then(function() {
      return $scope.module.all('releases').getList()
    })
    .then(function(releases){
      $scope.latestRelease = releases[releases.length - 1]
      $scope.module.releases = releases
    })



    // Editability
    $scope.editable = false
    $scope.toggleEdit = function() {
      $scope.editable = Boolean(1 - $scope.editable)
    }

    $scope.updateModule = function() {
      return $scope.module.put()
    }


    $scope.confirmDeleteModule = function() {
      if (confirm('"' + $scope.module.name + '" will be deleted.')) {

        $scope.module.remove()
        .finally(function() {
          $location.path('/')
        })
      }
    }

    $scope.incrementDownload = function() {
      $scope.latestRelease.downloadCount++
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

