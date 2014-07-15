// Module Creation Controllers
angular.module('modulusOne.createControllers', [])

  .controller('CreateCtrl', function($scope, Restangular, isCompleted, isEmpty,
    $state, Alert, readonlyAlert, Config, $window, $modal) {


    // If read only, do not allow this controller to be defined.
    if (Config.api.readOnly) {
      readonlyAlert.open()
      return false
    }

    /**
     * Create a release and module to use for uploaded content. This must happen
     * _before_ release and module metadata are sent, since the release upload
     * requires a module object to belong to.
     *
     * $scope.module and $scope.release will be populated
     *
     * @return {Promise} Resolved when module and release have been created.
     */
    $scope.createResources = function() {

      // Create a fresh module
      return Restangular.all('modules').post()
      .then(function(module) {
        $scope.module = angular.extend(module, $scope.module);
      })
      .then(function() {
        // Create a fresh release
        return $scope.module.all('releases').post(
          {module: {id: $scope.module.id}})
      })
      .then(function(release) {
        // Associate the release with the module record (this has already
        // happened on the server)
        $scope.module.releases = [release]
        $scope.release = angular.extend($scope.module.releases[0],
          $scope.release);
        $scope.created = true;
      });

    };

    /**
     * Delete a created module and release
     * @return {Promise} Resolved when deletion is complete
     */
    $scope.deleteResources = function deleteResources() {

      return $scope.module.remove()
      .then(function() {
        $scope.created = false;
      });
    };



    function uponExit(evt) {
      if (!$scope.completed) {
        var quit = $window.confirm('You have not finished uploading this module, and it will be '+
          'deleted. Continue?')
        if (quit) {
          $window.removeEventListener("beforeunload", this)
          return $scope.deleteResources();
        } else {
          evt.preventDefault()
          return false
        }
      }
    }

    function beforeUnloadPrompt() {
      if (!$scope.created) return;

      return "You have not finished uploading this module, and it will be " +
        "deleted.";
    }

    function syncDeleteModule() {
      if (!$scope.created) return true;

      // Send a module delete request. This must be done (sadly) with a direct
      // XMLHttpRequest, since AngularJS is hard-coded to send async requests.
      // This request must be sent sync so that the window doesn't close before
      // it's fired off.
      var req = new XMLHttpRequest();
      req.open("delete" , $scope.module.getRestangularUrl(), false);
      for (var h in Restangular.defaultHeaders) {
        req.setRequestHeader(h, Restangular.defaultHeaders[h]);
      }
      req.send();
    }

    $window.onbeforeunload = beforeUnloadPrompt;
    $window.onunload = syncDeleteModule;

    $scope.$on('$destroy', function() {
      $window.onbeforeunload = null;
      $window.onunload = null;
    })

    function uponStateChange(event, toState, toStateParams) {
      // Only display dialog if resources have been created but not completed.
      if (!$scope.created) return;
      if ($scope.created && $scope.completed) return;

      event.preventDefault();

      var modal = $modal.open({templateUrl: 'uponExitDialog.html'});
      modal.result.then(function removeModule() {

        return $scope.deleteResources()
        .then(function() {
          $scope.created = false;
          $state.go(toState, toStateParams);
        });

      });

    }

    // $window.addEventListener("beforeunload", uponBeforeUnload);
    $scope.$on("$stateChangeStart", uponStateChange);

    // Delete the module and release being created
    $scope.cancelUpload = function cancelUpload() {
      if ($scope.module) {
        return $scope.deleteResources()
        .finally(function() {
          $state.go('home');
        })
      } else {
        $state.go('home');
      }
    }

    // Update the module's and its releases' metadata
    $scope.finishCreation = function finishCreation() {
      $scope.release.put()
      .then(function() {
        return $scope.module.put()
      })
      .finally(function() {
        $scope.completed = true;
        $state.go('show', {id: $scope.module.id}).then(function() {
          console.debug('promise back');
          new Alert('success', $scope.module.name + ' was created and ' +
            'uploaded. Thank you for your contribution!').open()
        });
      })
    }

    $scope.isCompleted = isCompleted


  })

  .controller('ReleaseFileCtrl', function($scope, $upload, Restangular, Alert,
    Config) {

    // If read only, do not allow this controller to be defined.
    if (Config.api.readOnly) {
      return false;
    }

    function onProgress(evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
    }

    function onSuccess(data, status, headers, config) {
      // file is uploaded successfully
      $scope.success = true;

      var k;
      for (k in data) {
        $scope.release[k] = $scope.release[k] || data[k]
      }

      for (k in data.module) {
        $scope.module[k] = $scope.module[k] || data.module[k]
      }
    }

    function onError(err) {
      if (console.error) {
        console.error('Release upload error', err);
      }
      new Alert('danger', 'Encountered error while uploading release. ' +
               'Check the console for details.').open();
      $scope.progress = null;
    }

    // Use file chooser to pick a file
    $scope.selectFile = function selectFile() {
      var fileSelector = document.createElement('input');
      fileSelector.setAttribute('type', 'file');

      fileSelector.onchange = function(evt) {
        $scope.onFileSelect(fileSelector.files);
      };

      fileSelector.click();
    };

    // When file is chosen or dropped into the controller
    $scope.onFileSelect = function onFileSelect($files) {
      
      $scope.success = false; // Set to false in case this is a re-upload

      // Start by creating a module and release to upload to.
      $scope.createResources()
      .then(function() {

        //$files: an array of files selected, each file has name, size, and type.
        var file = $files[0];
        var fileReader = new FileReader();


        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function(evt) {

          var buf = new Uint8Array(fileReader.result);
          var url = Restangular.one('modules', $scope.module.id).all('releases')
                      .one('upload', $scope.release.id);
          var headers = angular.extend({}, Restangular.defaultHeaders,
                                      {'Content-Type': file.type});

          $scope.upload = $upload.http({
            url: url.getRestangularUrl(),
            method: 'PUT',
            params: {'filename': file.name},
            headers: headers,
            data: buf.buffer
          }).progress(onProgress)
            .success(onSuccess)
            .error(onError)
        }

      });

    }
  })

  .controller('DuplicateModuleLookupCtrl', function($scope, Restangular) {

    /**
     * Search for modules whose names are similar to the given parameter.
     * @param  {String} name the name to search for
     * @return {Promise}     a promise resolved after the search request is
     *                         finished
     */
    $scope.findSimilar = function findSimilar(name) {

      return Restangular.oneUrl('search').get({
        q: name,
        complex: true
      })
      .then(function(results) {

        // Filter out the module on $scope.module, since it will be included
        // in the search results.
        var items = results.items.filter(function(m) {
          if (!$scope.module || !$scope.module.id) return true;

          return m.id != $scope.module.id;
        });

        if (items.length > 0) {
          $scope.displayAlert(items);
        }

      });
    };

    /**
     * Display an alert on the page, indicating that one of the modules
     * passed in `modules` may be a duplicate of this one.
     * @param  {Array<Module>} modules list of modules similar to this one
     * @return {undefined}
     */
    $scope.displayAlert = function displayAlert(modules) {

      // Displaying the alert from this data will be handled by the view.
      $scope.duplicates = modules;
    };

    $scope.init = function init() {

      // Check for duplicates whenever the module changes.
      $scope.$watch(function watcher() {
        if ($scope.module && $scope.module.name) {
          return $scope.module.name;
        }
      }, function listener(name) {
        if (name) {
          return $scope.findSimilar(name);
        }
      });

    };

  })