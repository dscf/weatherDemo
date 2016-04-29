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
          $scope.forecast = data.data.list;
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
          $scope.forecast = weatherService.mergeForecast(data.data.list);
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

      weatherService.getForecast(appCfg.defaultLocation.lat, appCfg.defaultLocation.lon, function(data) {
        $scope.forecast = weatherService.mergeForecast(data.data.list);
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
      },
      mergeForecast: function(data) {
        var byDate = {};
        var ret = [];
        //consolidate segments by date
        data.forEach(function(segment) {
          var temp = segment.main.temp;
          var tempMax = segment.main.temp_max;
          var tempMin = segment.main.temp_min;
          var main = segment.weather[0].main;

          var key = segment.dt_txt.substr(0, 10);

          if (!byDate[key]) {
            byDate[key] = {
              temp: [temp],
              tempMax: [tempMax],
              tempMin: [tempMin],
              main: [main]
            };
          } else {
            byDate[key].temp.push(temp);
            byDate[key].tempMax.push(tempMax);
            byDate[key].tempMin.push(tempMin);
            byDate[key].main.push(main);
          }
        });

        for (var key in byDate) {
          //get average, max, min tempratures
          ret.push({
            temp: byDate[key].temp.reduce(function(a, b) {
              return a + b;
            }) / byDate[key].temp.length,
            tempMax: Math.max.apply(null, byDate[key].tempMax),
            tempMin: Math.min.apply(null, byDate[key].tempMin),
            //use the weather of 12:00 as the main weather
            main: byDate[key].main.length > 3 ? byDate[key].main[4] : byDate[key].main[byDate[key].main.length - 1],
            dt: key
          });
        }
        //pick out today's data
        return ret.slice(1);
      }
    };
  }])

  .filter('temperature', function() {
      return function(data) {
        if (data && angular.isNumber(data)) {
          return Math.round(data) + " \xB0C";
        }
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
