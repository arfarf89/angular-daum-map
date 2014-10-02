(function (window, angular, daum, undefined) {
  'use strict';

  angular.module('angularDaumMap')
    .directive('daumMap', function ($timeout, $log) {
      return {
        restrict: 'E',
        transclude: true,
        replace: false,
        template: '<div class="angular-daum-map" style="width:100%;height:100%"><div class="angular-daum-map-container" style="width:100%;height:100%"></div><div ng-transclude style="display:none"></div></div>',
        scope: {
          center: '=center',
          level: '=level',
          mapTypeId: '=mapTypeId',
          draggable: '=draggable',
          events: '=events'
        },
        link: function (scope, element) {
          // map object
          var map, el;

          // event related state variables
          var dragging, settingCenterFromScope;
          dragging = false;
          settingCenterFromScope = false;

          if (!angular.isDefined(scope.level)) {
            $log.error('angular-daum-maps: map level property not set');
            return;
          }

          if (!angular.isObject(scope.center)) {
            $log.error('angular-daum-maps: could not find a valid center property');
            return;
          }
          el = angular.element(element).find('div')[1];
          map = new daum.maps.Map(el, {
            center: new daum.maps.LatLng(scope.center.latitude, scope.center.longitude),
            level: scope.level,
            mapTypeId: scope.mapTypeId,
            draggable: scope.draggable
          });
          map.addControl(new daum.maps.ZoomControl(), daum.maps.ControlPosition.RIGHT);

          daum.maps.event.addListener(map, 'dragstart', function () {
            dragging = true;
            $timeout(function () {
              scope.$apply(function (s) {
                if (s.dragging !== null) {
                  s.dragging = dragging;
                }
              });
            });
          });
          daum.maps.event.addListener(map, 'dragend', function () {
            dragging = false;
            $timeout(function () {
              scope.$apply(function (s) {
                if (s.dragging !== null) {
                  s.dragging = dragging;
                }
              });
            });
          });
          daum.maps.event.addListener(map, 'drag', function () {
            var c;
            c = map.getCenter();
            $timeout(function () {
              scope.$apply(function (s) {
                s.center.latitude = c.getLat();
                s.center.longitude = c.getLng();
              });
            });
          });
          daum.maps.event.addListener(map, 'zoom_changed', function () {
            if (scope.zoom !== map.getLevel()) {
              $timeout(function () {
                scope.$apply(function (s) {
                  s.zoom = map.getLevel();
                });
              });
            }
          });
          daum.maps.event.addListener(map, 'center_changed', function () {
            var c;
            c = map.getCenter();
            if (settingCenterFromScope) {
              return;
            }
            $timeout(function () {
              scope.$apply(function (s) {
                if (!dragging) {
                  s.center.latitude = c.getLat();
                  s.center.longitude = c.getLng();
                }
              });
            });
          });

          if (angular.isDefined(scope.events) && scope.events !== null && angular.isArray(scope.events)) {
            angular.forEach(scope.events, function (event) {
              if (angular.isFunction(event.handler)) {
                daum.maps.event.addListener(map, event.name, function () {
                  return event.handler.apply(scope, [map, event.name, arguments]);
                });
              }
            });
          }

          scope.$watch('center', function (newValue) {
            if (!angular.isObject(newValue)) {
              $log.error('Invalid center for newValue: ' + (JSON.stringify(newValue)));
              return;
            }

            var center = new daum.maps.LatLng(newValue.latitude, newValue.longitude);
            if (center.getLat() === map.getCenter().getLat() && center.getLng() === map.getCenter().getLng()) {
              return;
            }

            settingCenterFromScope = true;
            if (!dragging) {
              if (scope.level === map.getLevel()) {
                map.panTo(center);
              } else {
                map.setCenter(center);
              }
            }
            settingCenterFromScope = false;
            return settingCenterFromScope;
          }, true);
          scope.$watch('level', function (newValue) {
            if (newValue === map.getLevel()) {
              return;
            }
            $timeout(function () {
              map.setLevel(newValue);
            });
          });
          scope.map = map;
        },
        controller: function ($scope) {
          angular.extend(this, {
            getMap: function () {
              return $scope.map;
            }
          });
        }
      };
    });
})(window, window.angular, window.daum);
