/* Services */

angular.module('modulusOne.services', [])

  .value('version', '0.0.1')


  .factory('getModule', function(Restangular) {
    return function(scope, id) {
      return Restangular.one('modules', id).get()
              .then(function(module) {
                scope.module = module
              })
    }
  })


  .factory('isReleaseCompleted', function() {

    return function(release) {
      if (!release.$fromServer) {
        // if this release hasn't been loaded we can't check it anyway
        return true
      }

      if (release && release.moduleVersion && release.requiredOMRSVersion &&
        release.downloadURL) {

        return true

      } else {
        return false
      }
    }
  })

  .factory('isCompleted', function(isReleaseCompleted) {

    return function(module, checkRelease) {
      checkRelease = checkRelease || true

      if (module && module.name) {

        if (!checkRelease) {
          return true
        } else if (_.filter(module.releases, isReleaseCompleted).length > 0) {
          return true
        }
      }

      return false
    }
  })

  .factory('isEmpty', function(isReleaseCompleted) {
    return function(module) {
      if (!module || (!module.name && !module.description &&
        _.filter(module.releases, isReleaseCompleted).length === 0 )) {

        return true

      } else {
        return false
      }
    }
  })


  .factory('MessageService', ['$rootScope', function($rootScope) {

    return {
        publish: function(name, parameters) {
            $rootScope.$emit(name, parameters);
        },
        subscribe: function(name, listener) {
            $rootScope.$on(name, listener);
        }
    };
  }])


  .factory('AlertError', function($rootScope) {
    return function(message) {
      $rootScope.$broadcast('alert', message)
    }
  })

  .factory('Alert', function($rootScope) {
    $rootScope.alerts = $rootScope.alerts || []

    function Alert(type, message) {
      this.type = type
      this.message = message
      this.isOpen = false
      this.showDetails = false

      return this
    }

    Alert.prototype.open = function open() {
      if (!_.contains($rootScope.alerts, this)) {
        $rootScope.alerts.push(this)
      }
      this.isOpen = true
    }
    Alert.prototype.close = function close() {
      this.showDetails = false
      _.pull($rootScope.alerts, this)
      this.isOpen = false
    }
    Alert.prototype.toggleDetails = function toggleDetails() {
      this.showDetails = Boolean(this.showDetails - 1)
    }

    return Alert
  })

  .factory('prepareModule', function() {
    return function(module) {
      // Remove release subresource data. This makes requests smaller and
      // prevents a duplicate resource bug on module upload.
      var releases = module.releases
      if (!releases) {
        return module
      }

      module.releases = _.map(releases, function(release) {
        return {class: release.class, id: release.id}
      })

      return module
    }
  })




