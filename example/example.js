'use strict';

angular.module('example', ['angularDaumMap'])
  .controller('MainCtrl', function ($scope) {
    $scope.map = {
      center: {
        latitude: 37.5157756,
        longitude: 127.0339472
      },
      level: 5,
      draggable: true,
      mapTypeId: daum.maps.MapTypeId.ROADMAP, // need to hide daum object here
    };

    $scope.orig = {
      position: {
        latitude: 37.5157756,
        longitude: 127.0339472
      },
      label: 'Origin'
    };

    $scope.dest = {
      position: {
        latitude: 37.5147756,
        longitude: 127.0229472
      },
      label: 'Destination'
    }

  });

