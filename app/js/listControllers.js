angular.module('modulusOne.listControllers', [])
  .controller('ListModulesCtrl', function($scope, Restangular, isCompleted,
    $stateParams) {

      $scope.showPager = true
      $scope.pageSize = 25
      $scope.page = parseInt($stateParams.page, 10) || 1

      Restangular.all('modules').getList({
        max: $scope.pageSize,
        offset: ($scope.page - 1) * $scope.pageSize,
        sort: 'lastUpdated',
        order: 'desc'
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

