angular.module('modulusOne.searchControllers', [])

  .controller('SearchCtrl', function($scope, Restangular, $location) {


    $scope.searching = false

    // Initial query for the homepage
    if ($location.path() === '/') {
      Restangular.all('modules').getList({
        max: 25,
        sort: 'downloadCount',
        order: 'desc'
      }).then(function(mostPopularModules) {
        $scope.modules = mostPopularModules
      })
    }

    function doSearch(query) {
      $scope.query = query

      if (!$scope.query || $scope.searching) {
        return
      }

      $scope.searching = true
      Restangular.oneUrl('search').get({
        q: $scope.query
      })
      .then(function(results) {
        $scope.searching = false
        $scope.results = results
        $scope.modules = results.items

        // $location.path('/search/' + query)
      })
    }
    $scope.doSearch = doSearch

    $scope.$watch('query', _.throttle(doSearch, 500, {trailing: true}))
  })
