angular.module('modulusOne.apiServices', [])

.factory('Module', function(Restangular) {
  var route = 'modules'

  return function(optionalId) {
    if (optionalId) {
      return Restangular.one('modules', optionalId)
    } else {
      return Restangular.all('modules')
    }

  }

})

.factory('Release', function(Restangular) {

})