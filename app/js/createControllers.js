// Module Creation Controllers
angular.module('modulusOne.createControllers', [])

  .controller('CreateCtrl', function($scope, ModuleService, ReleaseService) {

    var module, release

    window.ReleaseService = ReleaseService

    // create a fresh module
    module = $scope.module = ModuleService.new()

    // create a fresh release
    module.$promise.then(function() {
      release = $scope.release = ReleaseService.new(
        {moduleId: module.id},      // query parameters
        {module: {id: module.id}})  // request body


    })


    function uponExit(evt) {
      if (!module.complete) {
        console.debug("Deleting unfinished module")
        module.$delete({id: module.id})
      }
    }

    window.addEventListener("beforeunload", uponExit)
    $scope.$on("$locationChangeStart", uponExit)

    $scope.cancelUpload = function cancelUpload() {
      uponExit()
    }

    $scope.finishUpload = function finishUpload() {
      $scope.$broadcast('doReleaseMetadataUpdate')

      $scope.$on('releaseMetadataUpdated', function() {
        $scope.$broadcast('doModuleMetadataUpdate')

        $scope.$on('moduleMetadataUpdated', function() {
          console.log('finished!')
        })
      })
    }


  })




  .controller('ModuleMetadataCtrl', function($scope, $rootScope) {

    $rootScope.foo = 'baz'

    $scope.$on('doModuleMetadataUpdate', function() {
      var module = $scope.module

      console.debug('updating module')

      angular.extend(module, {
        name: $scope.name,
        description: $scope.description,
        documentationURL: $scope.documentationURL
      })

      module.$save({id: module.id}, function(module) {
        $scope.module = module
        console.debug('module updated', module)
        $scope.$emit('moduleMetadataUpdated')
      })
    })
  })




  .controller('ReleaseMetadataCtrl', function($scope) {

    $scope.$on('doReleaseMetadataUpdate', function() {
      var module = $scope.module
      ,   release = $scope.release

      release.module = module

      console.debug('updating release')

      angular.extend(release, {
        moduleVersion: $scope.moduleVersion,
        requiredOMRSVersion: $scope.requiredOMRSVersion
      })

      release.$save({id: release.id, moduleId: module.id}, function(release) {
        $scope.release = release
        console.debug('release updated', release)
        $scope.$emit('releaseMetadataUpdated')
      })
    })
  })




  .controller('ReleaseFileCtrl', function($scope, $upload, server) {

    $scope.filename = "Hello"

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

    $scope.selectFile = function() {
      var fileSelector = document.createElement('input');
      fileSelector.setAttribute('type', 'file');

      fileSelector.onchange = function(evt) {
        $scope.onFileSelect(fileSelector.files)
      }

      fileSelector.click()
    }

    $scope.onFileSelect = function($files) {

      //$files: an array of files selected, each file has name, size, and type.
      var file = $files[0]
      ,   fileReader = new FileReader()


      fileReader.readAsArrayBuffer(file)
      fileReader.onload = function(evt) {

        var buf = new Uint8Array(fileReader.result)

        $scope.upload = $upload.http({
          url: server + '/api/modules/' + $scope.module.id +
            '/releases/upload',
          method: 'POST',
          params: {'filename': file.name},
          headers: {'Content-Type': file.type},
          data: buf.buffer
        }).progress(onProgress)
          .success(onSuccess)
          .error(onError)
      }

    }
  })