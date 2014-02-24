'use strict';

/* Directives */


angular.module('modulusOne.directives', [])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('twbsTooltip', function() {
    return {
      link: function(scope, element, attrs) {


        $(element).attr('data-toggle', 'tooltip')
          .attr('title', attrs.twbsTooltip)
          .tooltip()
      }
    }
  })
