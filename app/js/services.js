'use strict';

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


  .factory('Modules', function(ModuleService) {
    var Modules = []

    Modules.get = function(id) {
      ModuleService.get(id)
        .then
    }


    return Modules
  })



  .factory('DeleteUnfinishedOnExit', function(resource) {
    window.addEventListener()
  })

  .factory('AlertError', function($rootScope) {
    return function(message) {
      $rootScope.$broadcast('alert', message)
    }
  })

