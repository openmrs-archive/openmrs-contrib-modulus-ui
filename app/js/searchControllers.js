angular.module('modulusOne.searchControllers', [])

  .controller('SearchCtrl', function($scope, Restangular, $location) {

    $scope.searching = false

    // Default query for the homepage or search page
    var defaultSearchResults = function() {
      Restangular.all('modules').getList({
        max: 25,
        sort: 'downloadCount',
        order: 'desc'
      }).then(function(mostPopularModules) {
        $scope.modules = mostPopularModules
      })
    }

    if ($location.path() === '/') {
      defaultSearchResults();
    }

    function doSearch(query) {
      $scope.query = query

      // Abort if we're in the middle of searching
      if ($scope.searching) {
        return
      }

      // If query field empty, return default list of modules
      if (!$scope.query) {
        defaultSearchResults()
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
