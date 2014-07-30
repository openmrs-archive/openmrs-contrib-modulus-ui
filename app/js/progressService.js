angular.module('modulusOne.progressService', ['ngProgressLite'])
.factory('ProgressTask', function(ProgressService, $timeout) {

  // Number of milliseconds until the progress bar will be resolved anyway.
  // Used to keep a request that gets stuck from keeping the progress bar up
  // forever.
  var TIMEOUT = 15 * 1000;
  var tasks = [];

  var ProgressTask = function(opts) {
    opts = opts || {};

    // ProgressService.incrRemaining();
    ProgressService.oneStarted();

    this.name = opts.name;
    this._completed = false;
    this._timeout = $timeout(
      _.bind(this.resolve, this),
      TIMEOUT
    );

    tasks.push(this);

    return this;
  }

  ProgressTask.prototype.resolve = function resolve() {

    if (!this._completed) {
      ProgressService.oneDone();
      this._complete();
    }

  };

  ProgressTask.prototype.reject = function reject() {

    if (!this._completed) {
      ProgressService.oneFailed();
      this._complete();
    }

  };

  ProgressTask.prototype._complete = function _complete() {
    this._completed = true;
    $timeout.cancel(this._timeout);
  }

  return ProgressTask;
})


.factory('ProgressService', function(ngProgressLite, $timeout) {

  var ProgressService = {};
  var tasks = 0;
  var _started = false;

  // ngProgressLite.color('#53AFFF');

  function started () {
    // return ngProgressLite.status() !== 0;
    return _started;
  };

  var update = ProgressService.update = function update() {
    if (!started() && tasks > 0) { // Progressbar not started
      ngProgressLite.start();
      _started = true;
    } else if (started() && tasks < 1) { // Progress completed
      deferToComplete();
    } else if (started() && tasks > 0) { // Progress in progress
      ngProgressLite.inc();
    }
  };

  var deferToComplete = _.debounce(function deferToComplete() {
    ngProgressLite.done();
    _started = false;
  }, 400);

  ProgressService.oneStarted = function oneStarted() {
    tasks++;
    update();
  };

  ProgressService.oneDone = function oneDone() {
    if (tasks > 0) tasks--;
    update();
  };

  ProgressService.oneFailed = function oneFailed() {
    tasks = 0;
    ngProgressLite.done();
  };

  return ProgressService;

})

.factory('ProgressBar', function(ProgressTask, ProgressService, Restangular,
$rootScope) {

  var ProgressBar = {};

  ProgressBar.bootstrap = function bootstrap() {

    var restangularTasks = {};

    // Make all Restangular requests create progressbar tasks.
    Restangular.addRequestInterceptor(
    function(element, operation, what, url) {

      restangularTasks[url] = new ProgressTask({name: operation + ' ' + url});
      return element;

    });

    Restangular.addResponseInterceptor(
    function(data, operation, what, url, response, deferred) {

      restangularTasks[url].resolve();
      return data;

    });

    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {

      toState.data = toState.data || {};
      toState.data.progressTask = new ProgressTask({
        name: 'stateChange to ' + toState.name
      });

    });

    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {

      if (toState.data && toState.data.progressTask) {
        toState.data.progressTask.resolve();
      } else {
        ProgressService.oneDone();
      }

    });

    $rootScope.$on('$stateChangeError',
    function(event, toState, toParams, fromState, fromParams) {
      toParams._progressTask.reject();
    });

  };



  return ProgressBar;

});