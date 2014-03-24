angular.module('modulusOne.searchControllers', [])

  .controller('SearchCtrl', function($scope, Restangular, $routeParams,
    $location) {


    $scope.searching = false
    $scope.query = $routeParams.query

    console.log('path', $location.path(), $location.path() === '/')

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
      query = query || $scope.query

      if (!query || $scope.searching) {
        return
      }

      $scope.searching = true
      Restangular.oneUrl('search').get({
        q: query
      })
      .then(function(results) {
        $scope.searching = false
        $scope.results = results
        $scope.modules = results.items
      })
    }

    $scope.$watch('query', _.throttle(doSearch, 500, {trailing: true}))
  })
