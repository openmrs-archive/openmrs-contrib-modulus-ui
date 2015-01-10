angular.module('modulusOne.showControllers', [
  'ui'
])
.controller('ShowModuleCtrl', function($scope, module, Restangular, $stateParams,
    $state, getModule, $rootScope, readonlyAlert, Config, AuthService) {

    $scope.module = module;
    $rootScope.title = $scope.module.name;

    // Load all releases for this module.
    $scope.module.all('releases').getList({sort: 'moduleVersion',
      order: 'desc'})

    // Stick release variables into scope.
    .then(function(releases){
      $scope.latestRelease = releases[0] // release list sorted by dateCreated
      $scope.module.releases = releases
    })


    // Allow the view to access the logged-in user.
    $scope.user = AuthService.user;


    // Editability
    $scope.editable = false
    $scope.toggleEdit = function() {
      if (Config.api.readOnly) {
        readonlyAlert.open()
        return false
      }
      $scope.editable = Boolean(1 - $scope.editable)
    }

    $scope.updateModule = function(toggleEditWhenDone) {
      return $scope.module.put()
      .then(function(updatedModule) {
        // copy the release list since it has not changed
        var releases = $scope.module.releases

        // update the module record in scope
        $scope.module = updatedModule
        $scope.module.releases = releases

        if (toggleEditWhenDone) $scope.toggleEdit()
      })
    }

    $scope.cancelEdit = function(toggleEditWhenDone) {
      $state.transitionTo($state.current, $stateParams, {
        reload: true, inherit: false, notify: true
      });

      if (toggleEditWhenDone) $scope.toggleEdit()
    }

    $scope.confirmDeleteModule = function() {
      if (Config.api.readOnly) {
        readonlyAlert.open()
        return false
      }

      if (confirm('"' + $scope.module.name + '" will be deleted.')) {

        $scope.module.remove()
        .finally(function() {
          $state.go('browse');
        })
      }
    }

    $scope.incrementDownload = function() {
      $scope.latestRelease.downloadCount++;
      $scope.module.downloadCount++
    }

    // converts from slug to readable name
    $scope.linkRequiredModules = function() {
      for (module in $scope.module.requiredModules) {
        var ModulesArray = []

        Restangular.one('modules', $scope.module.requiredModules[module]).get()
        .then(function(modules) {
          ModulesArray.push(modules.name)
          $scope.module.requiredModules[module] = modules.name
        })
      }
    }

    // Search function that typeahead in the `owner` field calls
    $scope.searchUsers = function(query) {

      // Query the API for users
      return Restangular.oneUrl('search').get({
        type: 'user',
        q: query
      })
      .then(function(search) {
        return search.items.map(function(user) {
          return user.username
        });
      })
    }

  })

// Manages Select2 elements used to search for and find users
.controller('UserSelectController', function($scope, Restangular) {

  // Using these fake values helps Select2 recognize that there is data to
  // be loaded, and thus call its `initSelection()` method, which is what
  // load the _actual_ initial data.
  var dummyOwner = $scope.chosenOwner = {id: 0, text: 'Loading...'}
  var dummyMaintainers = $scope.chosenMaintainers = [{id: 0, text: 'Loading...'}]

  // Update the Module object when the selected owner changes
  $scope.$watch('chosenOwner', function(newValue, oldValue) {

    // AngularUI-Select2's current implementation weirdly changes the object
    // bound to newValue to a string, after user interaction. We only want to
    // update the canonical module object when chosenOwner is an object.
    if (typeof newValue === 'object' && newValue != dummyOwner) {
      $scope.module.owner = {id: newValue.id, username: newValue.text}
    }
  })

  // Update the Module object when the selected maintainers change
  $scope.$watch('chosenMaintainers', function(newValue, oldValue) {

    // AngularUI-Select2's current implementation weirdly changes the array
    // bound to newValue to a string, after user interaction. We only want to
    // update the canonical module object when chosenMaintainers is an array.
    if (typeof newValue === 'object' && newValue != dummyMaintainers) {
      $scope.module.maintainers = newValue.map(function(u) {
        return {id: u.id, username: u.text}
      })
    }
  })

  // Search for users within the select2 interface
  function selectUsernameSearch(options) {
    // Query the API for users
    Restangular.oneUrl('search').get({
      type: 'user',
      q: options.term
    })

    // Map search results into data understandable by select2
    .then(function(search) {
      return search.items.map(function(user) {
        return {id: user.id, text: user.username}
      })
    })

    // Return these mapped results
    .then(function(users) {
      options.callback({results: users})
    })
  }

  // Options used for the `owner` field
  $scope.ownerOpts = {
    allowClear: false,
    containerCssClass: 'select-container',

    initSelection: function(elem, callback) {
      if ($scope.module && $scope.module.owner) {
        callback({id: $scope.module.owner.id,
          text: $scope.module.owner.username})
      }

    },

    query: selectUsernameSearch
  }

  // Options used for the `maintainers` field
  $scope.maintainersOpts = {
    multiple: true,
    containerCssClass: 'select-container',

    placeholder: 'Select one or more maintainers',

    initSelection: function(elem, callback) {
      if ($scope.module && $scope.module.maintainers) {
        var selection = $scope.module.maintainers.map(function(user) {
          // TODO: If current user, add locked: true to the array below
          return {id: user.id, text: user.username}
        })
        callback(selection)
      }
    },

    query: selectUsernameSearch
  }
})

.controller('RedirectToShowModuleCtrl', function(getModule, $scope,
$stateParams, $state) {
  getModule($scope, $stateParams.id)
  .then(function() {

    // Redirect to the "complete" URL if necessary (like /show/id/slug)
    if ($stateParams.slug !== $scope.module.slug) {
      $state.go('show', {
        id: $scope.module.id,
        slug: $scope.module.slug
      }, {
        location: 'replace'
      });
    }
  })
})

.controller('NewReleaseCtrl', function($scope, $filter, AuthService, $state) {

  // Disable this controller if the user cannot edit this module.
  if (!$filter('canEdit')(AuthService.user, $scope.module)) {
    return false;
  }

  /**
   * Called by ReleaseFileCtrl to create the release object to upload to.
   * Calls the API to create a Release, then passes that release on
   * @return {Promise} Promise resolving with the Release to upload to
   */
  $scope.createResources = function createResources() {
    return $scope.module.all('releases').post({
      module: {id: $scope.module.id}
    })
    .then(function(release) {
      $scope.release = release;
      return release;
    })
  };

  /**
   * Update the release and change state to the module details view.
   * @return {promise} Promise that will be resolved after state change.
   */
  $scope.completeUpload = function completeUpload() {
    return $scope.release.put()
    .then(function() {

      return $state.go('show', {
        id: $scope.module.id,
        slug: $scope.module.slug
      }, {
        reload: true
      });

    });
  };

  /**
   * Delete the created release (if any) and return to the module details view
   * @return {promise} Promise that will be resolved after state change.
   */
  $scope.cancel = function cancel() {
    if ($scope.release) {
      return $scope.release.remove().then(returnToState);
    } else {
      return returnToState();
    }

    function returnToState() {
      return $state.go('show', {
        id: $scope.module.id,
        slug: $scope.module.slug
      });
    }
  }

})


// Link to the required Module
.filter('linkModule', function($sanitize) {
  return function(module) {
    if (!module) return null

      return 'https://modules.openmrs.org/#/show/' + module
    }
  })

// Link to a user's wiki profile
.filter('wikiprofile', function($sanitize) {
  return function(user) {
    if (!user) return null

    return 'https://wiki.openmrs.org/display/~' + user.username
  }
})

// Show user's avatar
.filter('avatar', function($sanitize) {
  return function(user) {
    if (!user) return null
    return 'https://talk.openmrs.org/user_avatar/talk.openmrs.org/' + user.username + '/32/1.png'
  }
})

// Translate a user object to the format used by Select2
.filter('selectable', function() {
  return function(user) {
    if (!user) return false
    return {id: user.id, text: user.username}
  }
})

.filter('canEdit', function canEdit() {
  return function(user, module) {
    if (!user || !module) return false;

    var isAdmin = _.contains(user.roles, 'ROLE_ADMIN');
    var isMaintainer = _.contains(
      _.map(module.maintainers, 'id'),
      user.id
    );

    return isMaintainer || isAdmin;
  }
})
