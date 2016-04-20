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

  .controller('bodyController', ['$scope', function($scope) {
    $scope.city = undefined;
    $scope.invalidCity = false;
    $scope.updateCity = function() {
      var lat;
      var lng;
      var geometry = $scope.city.place.geometry;
      if (geometry) {
        lat = Math.floor(geometry.location.lat());
        lng = Math.floor(geometry.location.lng());
      } else {
        $scope.invalidCity = true;
      }
      console.log(lat, lng);
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
