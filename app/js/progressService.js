angular.module('modulusOne.progressService', ['ngProgress'])
.factory('ProgressTask', function(ProgressService, $timeout) {

  // Number of milliseconds until the progress bar will be resolved anyway.
  // Used to keep a request that gets stuck from keeping the progress bar up
  // forever.
  var TIMEOUT = 15 * 1000;

  var ProgressTask = function() {
    console.debug('task created');
    ProgressService.incrRemaining();

    $timeout(this.resolve, TIMEOUT);

    this._completed = false;

    return this;
  }

  ProgressTask.prototype.resolve = function resolve() {
    console.debug('task resolved');

    if (!this._completed) {
      ProgressService.incrDone();
      this._completed = true;
    }

  };

  ProgressTask.prototype.reject = function reject() {
    console.debug('task rejected');

    if (!this._completed) {
      ProgressService.fail();
      this._completed = true;
    }

  };

  return ProgressTask;
})


.factory('ProgressService', function(ngProgress) {

  var ProgressService = {};

  var finished = 0;
  var total = 0;

  ProgressService.incrRemaining = function startedOne() {
    total++;
    ProgressService.progress(finished, total);
  };

  ProgressService.incrDone = function finishedOne() {
    finished++;
    ProgressService.progress(finished, total);
  }

  ProgressService.progress = function progress(completed, total) {

    var percentage = (completed / total) * 100;

    console.debug('progress:', percentage);

    ngProgress.set(percentage);

    if (percentage === 100) {
      ngProgress.complete();
    }

  };

  ProgressService.fail = function fail() {
    ngProgress.reset();
  }

  return ProgressService;

})

.factory('ProgressBar', function(ProgressTask, Restangular, $rootScope) {

  var ProgressBar = {};

  ProgressBar.bootstrap = function bootstrap() {

    var tasks = {};

    function start(name) {
      tasks[name] = new ProgressTask();
      return tasks[name];
    }

    function _resolve(name) {
      if (tasks[name]) {
        var result = tasks[name].resolve();
        delete tasks[name];
        return result;
      }
    }

    function _reject(name) {
      if (tasks[name]) {
        var result = tasks[name].reject();
        delete tasks[name];
        return result;
      }
    }

    // Make all Restangular requests create progressbar tasks.
    Restangular.addRequestInterceptor(
    function(element, operation, what, url) {

      start(url);
      return element;

    });

    Restangular.addResponseInterceptor(
    function(data, operation, what, url, response, deferred) {

      _resolve(url);
      return data;

    });

    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {

      var taskName = fromState.name + ':' + toState.name;
      start(taskName);
    });

    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {

      var taskName = fromState.name + ':' + toState.name;
      _resolve(taskName);

    });

    $rootScope.$on('$stateChangeError',
    function(event, toState, toParams, fromState, fromParams) {
      var taskName = fromState.name + ':' + toState.name;
      _reject(taskName);
    });

  };



  return ProgressBar;

});