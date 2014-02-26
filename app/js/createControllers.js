// Module Creation Controllers
angular.module('modulusOne.createControllers', [])

  .controller('CreateCtrl', function($scope, Restangular, isCompleted) {


    // Create a fresh module
    Restangular.all('modules').post()
    .then(function(module) {
      $scope.module = module
      console.debug('module created')
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
      console.debug('release created')
    })

    .catch(function(err) {
      console.error('create resources error', err)
    })
    .finally(function() {
      console.debug('resources created')

      window.module = $scope.module
      window.release = $scope.release
    })



    function uponExit(evt) {
      if (!isCompleted($scope.module)) {
        confirm('You have not finished uploading this module, and it will be '+
          'deleted. Continue?')
        console.debug("Deleting unfinished module")
        return $scope.module.remove();
      }
    }

    window.addEventListener("beforeunload", uponExit)
    $scope.$on("$locationChangeStart", uponExit)

    // Delete the module and release being created
    $scope.cancelUpload = function cancelUpload() {
      return $scope.module.remove();
    }

    // Update the module's and its releases' metadata
    $scope.metadataUpdate = function metadataUpdate() {
      return $scope.module.put()
    }

    $scope.isCompleted = isCompleted


  })



  .controller('ReleaseFileCtrl', function($scope, $upload, server) {

    function onProgress(evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total)
    }

    function onSuccess(data, status, headers, config) {
      // file is uploaded successfully
      console.debug("upload success", data)
      $scope.releaseId = data.id
    }

    function onError() {
      console.error('it broke')
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

        $scope.upload = $upload.http({
          url: server + '/api/modules/' + $scope.module.id +
            '/releases/upload/' + $scope.release.id,
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