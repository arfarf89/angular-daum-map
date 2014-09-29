angular-daum-map
================

**angular-daum-map** is a directive for AngularJS to wrap Daum Map.

## Dependencies

angular-daum-map requires AngularJS and Daum Map. Please include line below in *index.html*.

    <script type="text/javascript" src="http://apis.daum.net/maps/maps3.js?apikey=your_api_key"></script>

## Getting Started

### Installation

To use Bower package manager:

    bower install angular-daum-map

Using Grunt or Gulp, *angular.map.js* file will be automatically appended to *index.html* upon build. If you do not use package manager, clone this repository and manually add *angular-daum-map.js* file to *index.html*.

### Usage

    <daum-map center="map.center" draggable="map.draggable" level="map.level" map-type-id="map.mapTypeId" events="events">

where *map* is a scope variable:

    $scope.map = {
      center: {
        latitude: your_latitude,
        longitude: your_longitude
      },
      draggable: true, // or false
      level: 7, // zoom lovel from 1 to 9
      mapTypeId: daum.maps.MapTypeId.ROADMAP // refer to Daum Map Documentation for further info
    }

You also have to style the height of the following div:
  
    <div class="angular-daum-map-container"></div>

