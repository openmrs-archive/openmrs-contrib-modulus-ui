module.exports = function(config){
    config.set({
    basePath : '../',

    files : [
      'app/vendor/angular/angular.js',
      'app/vendor/angular-route/angular-route.min.js',
      'app/vendor/angular-mocks/angular-mocks.js',
      'app/vendor/angular-sanitize/angular-sanitize.min.js',
      'app/vendor/restangular/dist/restangular.min.js',
      'app/vendor/angular-xeditable/dist/js/xeditable.min.js',
      'app/vendor/danialfarid-angular-file-upload/dist/angular-file-upload.min.js',
      'app/vendor/angular-ui/build/angular-ui.min.js',
      'app/vendor/angular-local-storage/angular-local-storage.min.js',
      'app/vendor/lodash/dist/lodash.min.js',
      'app/js/**/*.js',
      'test/unit/**/*.js',
      'test/lib/**/*.js'
    ],

    exclude : [
      'app/lib/angular/angular-loader.js',
      'app/lib/angular/*.min.js',
      'app/lib/angular/angular-scenario.js',
      'test/unit/examples/*'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

})}
