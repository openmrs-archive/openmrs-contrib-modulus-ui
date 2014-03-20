/* Controllers */

angular.module('modulusOne.controllers', [])

  .controller('ShowModuleCtrl', function($scope, Restangular, $routeParams,
    $location, getModule, $rootScope) {

    getModule($scope, $routeParams.id)
    .then(function() {
      $rootScope.title = $scope.module.name

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

  .controller('ListModulesCtrl', function($scope, Restangular, isCompleted,
    $routeParams) {

      $scope.pageSize = 25
      $scope.page = parseInt($routeParams.page, 10) || 1

      Restangular.all('modules').getList({
        max: $scope.pageSize,
        offset: ($scope.page - 1) * $scope.pageSize,
        sort: 'lastUpdated'
      })
      .then(function(modules) {
        $scope.modules = _.filter(modules, isCompleted)
      })

      $scope.canPageRight = function() {
        if ($scope.modules) {
          return $scope.modules.length >= $scope.pageSize
        } else {
          return true // Prevent the next page button from briefly disappearing
        }
      }

      $scope.canPageLeft = function() {
        return $scope.page > 1
      }

  })

  .controller('AlertCtrl', function($scope) {

  })

