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
