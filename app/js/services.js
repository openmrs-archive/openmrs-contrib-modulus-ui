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
      this.type = type // one of 'success', 'info', 'warning', 'danger'
      this.message = message
      this.isOpen = false
      this.showDetails = false
      this.partial = null

      return this
    }

    Alert.prototype.open = function open() {
      if (!_.contains($rootScope.alerts, this)) {
        $rootScope.alerts.push(this)
      }
      this.isOpen = true
      return this
    }
    Alert.prototype.close = function close() {
      this.showDetails = false
      _.pull($rootScope.alerts, this)
      this.isOpen = false
      return this
    }
    Alert.prototype.toggleDetails = function toggleDetails() {
      this.showDetails = Boolean(this.showDetails - 1)
      return this
    }
    Alert.prototype.include = function(partial) {
      this.partial = partial
      return this
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

  .factory('readonlyAlert', function(Alert) {
    return new Alert('info')
      .include('partials/readonlyMessage.html')
  })

  // Allow jsUri uri-manipulation library to be injected. This service should
  // always be used to get access to jsUri. Do not access the global object.
  // See https://github.com/derek-watson/jsUri for API.
  .factory('Uri', function injectUri($window) {
    return $window.Uri;
  })


  .factory('Color' , function () {

    return {
      shade: function shadeColor2(color, percent) {
          var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
          return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
      }
    }

  })


