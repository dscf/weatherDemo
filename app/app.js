(function() {
  'use strict';
  /*appCfg defines
  country
  address type
  */
  var appCfg = {
    country: 'au',
    types: ['(cities)']
  };

  angular.module('weatherApp', [])

  .constant('appCfg', appCfg)

  .controller('bodyController', ['$scope', '$http', function($scope, $http) {

    $scope.city = undefined;
    $scope.invalidCity = false;
    $scope.weather = undefined;

    $scope.updateCity = function() {
      var lat;
      var lng;
      var geometry = $scope.city.place.geometry;
      if (geometry) {
        lat = geometry.location.lat();
        lng = geometry.location.lng();
      } else {
        $scope.invalidCity = true;
      }
      getWeather(lat, lng);
    };

    function getWeather(lat, lon) {
      $http({
        url: 'http://api.openweathermap.org/data/2.5/weather',
        method: 'GET',
        params: {
          lat: lat,
          lon: lon,
          units: 'metric',
          APPID: '09616d97516f44b23a52d4767cd38875'
        }
      }).then(function(data) {
        $scope.weather = data;
      }, function(err) {
        console.log(err);
      });
    }

  }])

  .filter('temperature', function() {
      return function(data) {
        return data + " \xB0C";
      };
    })
    .directive('myGoogleplace', ['appCfg', function(appCfg) {
      return {
        scope: {
          //which modle this input binds to
          myGoogleplaceModel: '=',
          //call back function will be excuted after select the city
          callback: '&myGoogleplaceCallback'
        },
        link: function(scope, element, attrs) {
          var options = {
            componentRestrictions: {
              country: appCfg.country
            },
            types: appCfg.types
          };
          scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

          google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
            //need to update scope every time select a new city
            scope.$apply(function() {
              var val = {
                'description': element.val(),
                'place': scope.gPlace.getPlace()
              };
              scope.myGoogleplaceModel = val;
            });
            scope.callback();
          });
        }
      };
    }]);
}());
