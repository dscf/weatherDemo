(function() {
  "use strict"
  angular.module("weatherApp", ['google.places'])
    .controller("bodyController", ["$scope", "$http", function($scope, $http) {
      $scope.city = {};
      $scope.autocompleteOptions = {
        componentRestrictions: {
          country: 'au'
        },
        types: ['(cities)']
      };
    }]);
}());
