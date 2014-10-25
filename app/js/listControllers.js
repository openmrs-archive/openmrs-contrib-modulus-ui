angular.module('modulusOne.listControllers', [])
  .controller('ListModulesCtrl', function($scope, Restangular, isCompleted,
    $stateParams, $state) {

      $scope.showPager = true;
      $scope.pageSize = 25;
      $scope.currentPage = parseInt($stateParams.page, 10) || 1;
      $scope.modules = [];

      Restangular.all('modules').getList({
        max: $scope.pageSize,
        offset: ($scope.currentPage - 1) * $scope.pageSize,
        sort: 'lastUpdated',
        order: 'desc'
      })
      .then(function(modules) {
        $scope.modules = _.filter(modules, isCompleted);
      });

      $scope.canPageRight = function() {
        if ($scope.modules) {
          return $scope.modules.length >= $scope.pageSize;
        } else {
          return false;
        }
      }

      $scope.canPageLeft = function() {
        return $scope.currentPage > 1;
      }

      $scope.changePage = function (num) {
        $state.go('browse', {page: num}, {reload: true});
      }

  })

