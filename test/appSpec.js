describe('appTest', function() {
  var $scope;
  var weatherService = {
    getWeather: jasmine.createSpy('weatherService.getWeather')
  };

  //load module and inject mock service
  beforeEach(module('weatherApp'));

  //initialize injection
  beforeEach(function() {
    inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();

      //to use $controller to initialize the controller instance, you need to pass all the dependencies that it requires.
      $controller("bodyController", {
        $scope: $scope,
        weatherService: weatherService
      });
    });
  });

  it('tests scope variables', function() {
    expect($scope.city).toEqual({
      description: 'Sydney'
    });
    expect($scope.invalidCity).toBe(false);
    expect(weatherService.getWeather).toHaveBeenCalled();
  });

  it('tests app config', function() {
    var appCfg;
    inject(function(_appCfg_) {
      appCfg = _appCfg_;
    });

    expect(appCfg.country).toBe("au");
    expect(appCfg.types).toEqual(['(cities)']);
    expect(appCfg.defaultLocation).toEqual({
      lat: -33.8737,
      lon: 151.2069,
      name: 'Sydney'
    });
  });

  it('tests city changes with invalid data', function() {
    $scope.city.place = {
      geometry: undefined
    };
    $scope.updateCity();
    expect($scope.invalidCity).toBe(true);
  });

  it('tests city changes with valid data', function() {
    $scope.city.place = {
      geometry: {
        location: {
          lat: function() {},
          lng: function() {}
        }
      }
    };
    $scope.updateCity();
    expect($scope.invalidCity).toBe(false);
    expect(weatherService.getWeather).toHaveBeenCalled();
  });
});
