// Module Creation Controllers
angular.module('modulusOne.createControllers', [])

  .controller('CreateCtrl', function($scope, Restangular, isCompleted, isEmpty,
    $location, Alert) {


    // Create a fresh module
    Restangular.all('modules').post()
    .then(function(module) {
      $scope.module = module
    })

    // Create a fresh release
    .then(function() {
      return $scope.module.all('releases').post(
        {module: {id: $scope.module.id}})
    })
    .then(function(release) {
      // Associate the release with the module record (this has already
      // happened on the server)
      $scope.module.releases = [release]
      $scope.release = $scope.module.releases[0]
    })


    .finally(function() {
      window.module = $scope.module
      window.release = $scope.release
    })



    function uponExit(evt) {
      if (!isCompleted($scope.module) && !isEmpty($scope.module)) {
        var quit = confirm('You have not finished uploading this module, and it will be '+
          'deleted. Continue?')
        if (quit) {
          window.removeEventListener("beforeunload", this)
          return $scope.module.remove();
        } else {
          evt.preventDefault()
          return false
        }
      }
    }

    window.addEventListener("beforeunload", uponExit)
    $scope.$on("$locationChangeStart", uponExit)

    // Delete the module and release being created
    $scope.cancelUpload = function cancelUpload() {
      if ($scope.module) {
        return $scope.module.remove()
        .finally(function() {
          $location.path('/')
        })
      } else {
        $location.path('/')
      }
    }

    // Update the module's and its releases' metadata
    $scope.finishCreation = function finishCreation() {
      $scope.release.put()
      .then(function() {
        return $scope.module.put()
      })
      .finally(function() {
        new Alert('success', $scope.module.name + ' was created and uploaded. '+
          'Thank you for your contribution!').open()
        $location.path('/show/'+$scope.module.id)
      })
    }

    $scope.isCompleted = isCompleted


  })



  .controller('ReleaseFileCtrl', function($scope, $upload, Restangular, Alert) {

    function onProgress(evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total)
    }

    function onSuccess(data, status, headers, config) {
      // file is uploaded successfully

      for (var k in data) {
        $scope.release[k] = $scope.release[k] || data[k]
      }
    }

    function onError(err) {
      if (console.error) {
        console.error('Release upload error', err)
      }
      new Alert('danger', 'Encountered error while uploading release.').open()
    }

    // Use file chooser to pick a file
    $scope.selectFile = function() {
      var fileSelector = document.createElement('input');
      fileSelector.setAttribute('type', 'file');

      fileSelector.onchange = function(evt) {
        $scope.onFileSelect(fileSelector.files)
      }

      fileSelector.click()
    }

    // When file is chosen or dropped into the controller
    $scope.onFileSelect = function($files) {

      //$files: an array of files selected, each file has name, size, and type.
      var file = $files[0]
      ,   fileReader = new FileReader()


      fileReader.readAsArrayBuffer(file)
      fileReader.onload = function(evt) {

        var buf = new Uint8Array(fileReader.result)
            url = Restangular.one('modules', $scope.module.id).all('releases')
                    .one('upload', $scope.release.id)

        $scope.upload = $upload.http({
          url: url.getRestangularUrl(),
          method: 'PUT',
          params: {'filename': file.name},
          headers: {'Content-Type': file.type},
          data: buf.buffer
        }).progress(onProgress)
          .success(onSuccess)
          .error(onError)
      }

    }
  })