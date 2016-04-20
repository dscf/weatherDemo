(function() {
  'use strict'
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
    $scope.updateCity = function() {
      var zipCode;
      var cityName;
      var componnets = $scope.city.place.address_components;
      if (componnets) {
        var postalCode = componnets.filter(x => x.types.indexOf('postal_code') !== -1);
        if (postalCode.length > 0) {
          zipCode = postalCode[0].long_name;
        }
        if (!zipCode) {
          var locality = componnets.filter(x => x.types.indexOf('locality') !== -1);
          if (locality.length > 0) {
            cityName = locality[0].long_name;
          }
        }
      }
      if(zipCode) {

      } else if(cityName) {

      } else {
        $scope.invalidCity = true;
      }
      console.log(zipCode, cityName);


    };
  }])

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
