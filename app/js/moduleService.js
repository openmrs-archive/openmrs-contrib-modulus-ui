'use strict';

angular.module('modulusOne.services2', []).factory('ModuleService',
  function($resource, server) {

    var resource = $resource(server + '/api/modules/:id', {}, {
      'list': {method: 'GET', isArray: true},
      'update': {method: 'PUT'}
    })

    var Modules = {

      _modules: [],

      get: function(id) {
        return resource.get(id)
      }

    }

    return Modules
  })