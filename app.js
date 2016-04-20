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

      $scope.updateCity = function() {
        var cityName;
        if ($scope.city.place.address_components) {
          console.log($scope.city.place.address_components)
          var locality = $scope.city.place.address_components.filter(x => x.types.indexOf('locality') !== -1);
          if (locality.length > 0) {
            cityName = locality[0].long_name;
          }
        }
        console.log(cityName);
      };

    }])
    .directive('myGoogleplace', ['appCfg', function(appCfg) {
      return {
        scope: {
          myGoogleplaceModel: '=',
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
