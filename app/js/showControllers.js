angular.module('modulusOne.showControllers', ['ui.select2'])
.controller('ShowModuleCtrl', function($scope, Restangular, $routeParams,
    $location, getModule, $rootScope, readonlyAlert) {

    // Load this page's module.
    getModule($scope, $routeParams.id)
    .then(function() {
      $rootScope.title = $scope.module.name

      // Redirect to the "complete" URL if necessary (like /show/id/slug)
      if ($routeParams.slug !== $scope.module.slug) {
        $location.path('/show/'+$scope.module.id+'/'+$scope.module.slug)
      }
    })

    // Load all releases for this module.
    .then(function() {
      return $scope.module.all('releases').getList({sort: 'dateCreated',
        order: 'desc'})
    })

    // Stick release variables into scope.
    .then(function(releases){
      $scope.latestRelease = releases[0] // release list sorted by dateCreated
      $scope.module.releases = releases
    })



    // Editability
    $scope.editable = false
    $scope.toggleEdit = function() {
      if (MODULUS_API_READ_ONLY) {
        readonlyAlert.open()
        return false
      }
      $scope.editable = Boolean(1 - $scope.editable)
    }

    $scope.updateModule = function() {
      return $scope.module.put()
    }


    $scope.confirmDeleteModule = function() {
      if (MODULUS_API_READ_ONLY) {
        readonlyAlert.open()
        return false
      }

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

.filter('user', function($sanitize) {
  return function(user) {
    return $sanitize('<a href="https://wiki.openmrs.org/display/' +
      user.username + '"> ' + user.username + '</a>')
  }
})