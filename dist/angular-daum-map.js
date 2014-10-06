(function (angular, undefined) {
  'use strict';
  angular.module('angularDaumMap', []);

})(window.angular);

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

(function (window, angular, daum, undefined) {
  'use strict';

  angular.module('angularDaumMap')
    .directive('daumMarkerLabel', function ($timeout) {
      return {
        restrict: 'E',
        require: '^daumMarker',
        transclude: true,
        replace: true,
        template: '<div class="angular-daum-map-marker-label" ng-transclude></div>',
        link: function (scope, element, attrs, markerCtrl, transcludeFn) {
          var label = new daum.maps.AbstractOverlay();
          var content;
          var position = markerCtrl.getMarkerPosition();
          var panel, el;

          transcludeFn(scope, function (cloned) {
            content = cloned;
          });

          label.onAdd = function () {
            panel = angular.element(label.getPanels().overlayLayer);
            panel.append(content);
            var children = panel.children();
            el = angular.element(children[children.length - 1]);
          };
          label.onRemove = function () {
            el.remove();
          };
          label.draw = function () {

            var projection = this.getProjection();
            var point = projection.pointFromCoords(new daum.maps.LatLng(position.latitude, position.longitude));
            el.css('whiteSpace', 'nowrap');
            el.css('position', 'absolute');
            var width = el.width();
            var height = el.height();

            el.css('left', (point.x - width / 2) + 'px');
            el.css('top', (point.y + 5) + 'px');

            $timeout(function () {
              width = el.width();
              height = el.height();
              el.css('left', (point.x - width / 2) + 'px');
              el.css('top', (point.y + 5) + 'px');
              if (typeof attrs.zIndex !== 'undefined') {
                el.css('z-index', attrs.zIndex);
              }
            });
          };
          scope.$watch(function () {
            return markerCtrl.getMap();
          }, function (map) {
            label.setMap(map);
          });
          scope.$on('$destroy', function () {
            label.setMap(null);
          });
        }
      };
    });

})(window, window.angular, window.daum);

(function (window, angular, daum, undefined) {
  'use strict';

  angular.module('angularDaumMap')
    .directive('daumMarker', function () {
      return {
        scope: {
          position: '=position',
          icon: '=icon',
          click: '&click',
          zIndex: '=zIndex',
          events: '=events'
        },
        restrict: 'E',
        require: '^daumMap',
        transclude: true,
        replace: true,
        template: '<span class="angular-daum-map-marker" ng-transclude></span>',
        link: function (scope, element, attrs, mapCtrl) {
          var marker = new daum.maps.Marker({
            position: new daum.maps.LatLng(scope.position.latitude, scope.position.longitude),
            image: (scope.icon) ? new daum.maps.MarkerImage(scope.icon.image, new daum.maps.Size(scope.icon.width, scope.icon.height)) : null
          });

          scope.$watch(function () {
            return mapCtrl.getMap();
          }, function (map) {
            marker.setMap(map);
            scope.map = map;
          });
          scope.$on('$destroy', function () {
            marker.setMap(null);
          });
          scope.$watch('position', function () {
            marker.setPosition(new daum.maps.LatLng(scope.position.latitude, scope.position.longitude));
          });
          scope.$watch('icon', function (newValue) {
            if(typeof newValue !== 'undefined' && newValue !== null) {
              marker.setImage(new daum.maps.MarkerImage(newValue.image, new daum.maps.Size(newValue.width, newValue.height)));
            }
          });
          scope.$watch('zIndex', function () {
            if (scope.zIndex) {
              marker.setZIndex(scope.zIndex);
            }
          });

          if (angular.isDefined(scope.events) && scope.events !== null && angular.isArray(scope.events)) {
            angular.forEach(scope.events, function (event) {
              if (angular.isFunction(event.handler)) {
                var data = { scope: scope, element: element, attrs: attrs };
                daum.maps.event.addListener(marker, event.name, function () {
                  return event.handler.apply(scope, [data, event.name, arguments]);
                });
              }
            });
          }

        },
        controller: function ($scope) {
          angular.extend(this, {
            getMarkerPosition: function () {
              return $scope.position;
            },
            getMap: function () {
              return $scope.map;
            }
          });
        }
      };
    });

})(window, window.angular, window.daum);

(function (window, angular, daum, undefined) {
  'use strict';

  angular.module('angularDaumMap')
    .directive('daumPolyline', function () {
      return {
        scope: {
          path: '=',
          strokeWeight: '=',
          strokeColor: '=',
          strokeOpacity: '=',
          fillColor: '=',
          fillOpacity: '='
        },
        restrict: 'E',
        require: '^daumMap',
        transclude: false,
        replace: true,
        template: '<span class="angular-daum-map-polyline"></span>',
        link: function (scope, element, attrs, mapCtrl) {
          var path = [];
          angular.forEach(scope.path, function (position) {
            path.push(new daum.maps.LatLng(position.latitude, position.longitude));
          });
          var polyline = new daum.maps.Polyline({
            path: path,
            strokeWeight: (scope.strokeWeight || 4),
            strokeColor: (scope.strokeColor || '#FF0000'),
            strokeOpacity: (scope.strokeOpacity || 0.5),
            fillColor: (scope.fillColor || '#FF0000'),
            fillOpacity: (scope.fillOpacity || 0.5)
          });

          scope.$watch(function () {
            return mapCtrl.getMap();
          }, function (map) {
            polyline.setMap(map);
            scope.map = map;
          });

          scope.$on('$destroy', function () {
            polyline.setMap(null);
          });
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
