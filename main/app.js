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

  var iconStyle = {};
  iconStyle["01d"] = "wi-day-sunny";
  iconStyle["02d"] = "wi-day-cloudy";
  iconStyle["03d"] = "wi-cloud";
  iconStyle["04d"] = "wi-cloudy";
  iconStyle["09d"] = "wi-day-showers";
  iconStyle["10d"] = "wi-day-rain";
  iconStyle["11d"] = "wi-day-thunderstorm";
  iconStyle["13d"] = "wi-day-snow";
  iconStyle["50d"] = "wi-day-fog";

  iconStyle["01n"] = iconStyle["01d"];
  iconStyle["02n"] = iconStyle["02d"];
  iconStyle["03n"] = iconStyle["03d"];
  iconStyle["04n"] = iconStyle["04d"];
  iconStyle["09n"] = iconStyle["09d"];
  iconStyle["10n"] = iconStyle["10d"];
  iconStyle["11n"] = iconStyle["11d"];
  iconStyle["13n"] = iconStyle["13d"];
  iconStyle["50n"] = iconStyle["50d"];


  angular.module('weatherApp', [])

  .constant('appCfg', appCfg)

  .constant('iconStyle', iconStyle)

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
          $scope.forecast = weatherService.mergeForecast(data.data.list);
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
          var desc = segment.weather[0].description;
          var icon = segment.weather[0].icon;

          var key = segment.dt_txt.substr(0, 10);

          if (!byDate[key]) {
            byDate[key] = {
              temp: [temp],
              tempMax: [tempMax],
              tempMin: [tempMin],
              desc: [desc],
              icon: [icon]
            };
          } else {
            byDate[key].temp.push(temp);
            byDate[key].tempMax.push(tempMax);
            byDate[key].tempMin.push(tempMin);
            byDate[key].desc.push(desc);
            byDate[key].icon.push(icon);
          }
        });

        for (var key in byDate) {
          //get average, max, min tempratures
          var totalTemp = byDate[key].temp.reduce(function(a, b) {
            return a + b;
          });
          var avgTemp = totalTemp / byDate[key].temp.length;
          //use the weather of 12:00 as the main weather
          var index = byDate[key].desc.length > 3 ? 4 : byDate[key].desc.length - 1;
          var midDayDesc = byDate[key].desc[index];
          var midDayIcon = byDate[key].icon[index];
          ret.push({
            temp: avgTemp,
            tempMax: Math.max.apply(null, byDate[key].tempMax),
            tempMin: Math.min.apply(null, byDate[key].tempMin),
            icon: midDayIcon,
            desc: midDayDesc,
            dt: key.substr(5, 10)
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
          return Math.round(data) + "\xB0";
        }
      };
    })
    .filter('iconstyle', function(iconStyle) {
      return function(key) {
        return iconStyle[key];
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
