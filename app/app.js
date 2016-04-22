(function() {
  'use strict';
  /*appCfg defines
  country
  address type
  */
  var appCfg = {
    country: 'au',
    types: ['(cities)'],
    defaultLocation: {
      lat: -33.8737,
      lon: 151.2069,
      name: 'Sydney'
    }
  };

  angular.module('weatherApp', [])

  .constant('appCfg', appCfg)

  .controller('bodyController', ['$scope', '$http', '$window', 'weatherService', 'appCfg', function($scope, $http, $window, weatherService, appCfg) {

    var gotUserLocation = false;
    $scope.city = undefined;
    $scope.invalidCity = false;
    $scope.weather = undefined;
    $scope.forecast = undefined;
    $scope.inEdit = false;


    $scope.updateCity = function() {
      var lat;
      var lng;
      var geometry = $scope.city.place.geometry;
      if (geometry) {
        lat = geometry.location.lat();
        lng = geometry.location.lng();
        weatherService.getWeather(lat, lng, function(data) {
          $scope.weather = data;
        });

        weatherService.getForecast(lat, lng, function(data) {
          $scope.forecast = data;
        });

        $scope.inEdit = false;
      } else {
        $scope.invalidCity = true;
      }
    };

    //entry point
    //try to get user's current location and weather
    if ($window.navigator.geolocation) {
      $window.navigator.geolocation.getCurrentPosition(function(position) {
        gotUserLocation = true;
        weatherService.getWeather(position.coords.latitude, position.coords.longitude, function(data) {
          $scope.weather = data;
          $scope.city = {
            description: data.data.name
          };
        });

        weatherService.getForecast(position.coords.latitude, position.coords.longitude, function(data) {
          $scope.forecast = data;
        });
      });
    }

    if (!gotUserLocation) {
      //display default location
      $scope.city = {
        description: appCfg.defaultLocation.name
      };
      weatherService.getWeather(appCfg.defaultLocation.lat, appCfg.defaultLocation.lon, function(data) {
        $scope.weather = data;
      });
    }
  }])

  .factory('weatherService', ['$http', function($http) {
    var serviceCall = function(url, lat, lon, callback) {
      return $http({
        url: url,
        method: 'GET',
        params: {
          lat: lat,
          lon: lon,
          units: 'metric',
          APPID: '09616d97516f44b23a52d4767cd38875'
        }
      }).then(function(data) {
        callback(data);
      }, function(err) {
        console.log(err);
      });
    };
    return {
      getWeather: function(lat, lon, callback) {
        return serviceCall('http://api.openweathermap.org/data/2.5/weather', lat, lon, callback);
      },
      getForecast: function(lat, lon, callback) {
        return serviceCall('http://api.openweathermap.org/data/2.5/forecast', lat, lon, callback);
      }
    };
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
