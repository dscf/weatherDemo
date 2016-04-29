describe('ControllerTest', function() {
  var $scope;
  var weatherService = {
    getWeather: jasmine.createSpy('weatherService.getWeather'),
    getForecast: jasmine.createSpy('weatherService.getForecast')
  };

  //load module and inject mock service
  beforeEach(module('weatherApp'));

  //initialize injection
  beforeEach(function() {
    inject(function($injector, $rootScope, $controller) {
      $scope = $rootScope.$new();
      //to use $controller to initialize the controller instance, you need to pass all the dependencies that it requires.
      $controller("bodyController", {
        $scope: $scope,
        weatherService: weatherService
      });
    });
  });

  it('tests scope initialization', function() {
    expect($scope.city).toEqual({
      description: 'Sydney'
    });
    expect($scope.invalidCity).toBe(false);
    expect(weatherService.getWeather).toHaveBeenCalled();
    expect(weatherService.getForecast).toHaveBeenCalled();
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
    expect(weatherService.getForecast).toHaveBeenCalled();
  });
});

describe('serviceTest', function() {
  var weatherService;
  var $httpBackend;

  beforeEach(module('weatherApp'));

  beforeEach(function() {
    inject(function($injector, _weatherService_) {
      weatherService = _weatherService_;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', /\/api\.openweathermap\.org\/data\/2\.5\/weather.*/).respond({
        data: {}
      });
      $httpBackend.when('GET', /\/api\.openweathermap\.org\/data\/2\.5\/forecast.*/).respond({
        list: [{
          main: {
            temp: 10,
            temp_max: 20,
            temp_min: 10
          },
          weather: [{}],
          dt_txt: '20160428 00:00:00'
        }]
      });
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('tests weatherService http requests', function() {
    $httpBackend.expectGET('http://api.openweathermap.org/data/2.5/weather?APPID=09616d97516f44b23a52d4767cd38875&lat=1&lon=2&units=metric');
    $httpBackend.expectGET('http://api.openweathermap.org/data/2.5/forecast?APPID=09616d97516f44b23a52d4767cd38875&lat=1&lon=2&units=metric');
    weatherService.getWeather(1, 2, function() {});
    weatherService.getForecast(1, 2, function() {});
    $httpBackend.flush();
  });

  it('tests merge forecast', function() {
    jasmine.getJSONFixtures().fixturesPath='base/test/';
    var forecast = getJSONFixture('forecast.json');
    var merged = weatherService.mergeForecast(forecast.data.list);
    expect(merged.length).toBe(4);
  });
});
