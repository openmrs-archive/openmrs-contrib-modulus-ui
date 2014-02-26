/* Services */

angular.module('modulusOne.services', [])

  .value('server', 'http://localhost:8080')
  .value('version', '0.0.1')

  .factory('ModuleService', ['$resource', 'server',
    function($resource, server) {

      return $resource(server + '/api/modules/:id', {
        'id': '@id'
      }, {
          'list': {method: 'GET', isArray: true},
          'new': {method: 'POST'},
          'save': {method: 'PUT'}
        })
  }])

  .factory('ReleaseService', ['$resource', 'server',
    function($resource, server) {

      return $resource(server + '/api/modules/:moduleId/releases/:id', {
        'moduleId': '@module.id',
        'id': '@id'
      }, {
        'list': {method: 'GET', isArray: true},
        'new': {method: 'POST'},
        'save': {method: 'PUT'}
      })

    }
  ])

  .value('isCompleted', function(module) {
    var string;
    if (module)
      string = 'id=' + module.id + ' completed?'

    if (module && module.name && module.description &&
      module.releases && module.releases.length > 0) {
        console.debug(string, 'true')
        return true

      } else {
        console.debug(string, 'false')
        return false
      }
  })

  .factory('UserService', ['$resource', 'server',
    function($resource, server) {

      return $resource(server + '/api/users/:userId/',
        {userId: "@id"})
  }])



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



  .factory('DeleteUnfinishedOnExit', function(resource) {
    window.addEventListener()
  })

  .factory('AlertError', function($rootScope) {
    return function(message) {
      $rootScope.$broadcast('alert', message)
    }
  })




