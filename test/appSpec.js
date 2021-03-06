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
    $scope.city = {
      place: {
        geometry: undefined
      }
    };
    $scope.updateCity();
    expect($scope.invalidCity).toBe(true);
  });

  it('tests city changes with valid data', function() {
    $scope.city = {
      place: {
        geometry: {
          location: {
            lat: function() {},
            lng: function() {}
          }
        }
      }
    };
    $scope.updateCity();
    expect($scope.invalidCity).toBe(false);
    expect(weatherService.getWeather).toHaveBeenCalled();
    expect(weatherService.getForecast).toHaveBeenCalled();
  });
});

describe('directiveTest', function() {
  var $compile;
  var $rootScope;

  beforeEach(module('weatherApp'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  it('tests myGoogleplace', function() {
    var element = angular.element('<input type="text" my-googleplace my-googleplace-model="city" my-googleplace-callback="updateCity()">');
    var scope = $rootScope.$new();
    var gPlace;
    $compile(element)(scope);
    scope.$digest();
    gPlace = element.isolateScope().gPlace;
    expect(gPlace).not.toBeFalsy();
    scope.updateCity = jasmine.createSpy('scope.updateCity');
    google.maps.event.trigger(gPlace, 'place_changed');
    scope.$digest();
    expect(scope.updateCity).toHaveBeenCalled();
  });

  it('test myLineChart', function() {
    var element = angular.element('<div my-line-chart chartdata="forecastBreak"></div>');
    var scope = $rootScope.$new();
    $compile(element)(scope);
    scope.$digest();
    expect(element.html()).toContain('"morris-hover');
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
      $httpBackend.when('GET', /weather.*/).respond({
        data: {}
      });
      $httpBackend.when('GET', /forecast.*/).respond({
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
    $httpBackend.expectGET('weather?lat=1&lon=2');
    $httpBackend.expectGET('forecast?lat=1&lon=2');
    weatherService.getWeather(1, 2, function() {});
    weatherService.getForecast(1, 2, function() {});
    $httpBackend.flush();
  });

  it('tests merge forecast', function() {
    jasmine.getJSONFixtures().fixturesPath = 'base/test/';
    var forecast = getJSONFixture('forecast.json');
    var merged = weatherService.mergeForecast(forecast.data.list);
    expect(merged.length).toBe(4);
  });

  it('tests extract forecast', function() {
    jasmine.getJSONFixtures().fixturesPath = 'base/test/';
    var forecast = getJSONFixture('forecast.json');
    var extracted = weatherService.extractForecast(forecast.data.list);
    expect(extracted.length).toBe(36);
  });
});

describe('filterTest', function() {
  var temperatureFilter;
  var iconStyle;
  beforeEach(module('weatherApp'));

  beforeEach(function() {
    inject(function($filter, _iconStyle_) {
      temperatureFilter = $filter('temperature');
      iconStyle = _iconStyle_;
    });
  });

  it('tests tempreture filter', function() {
    expect(temperatureFilter(23.5345)).toBe('24°');
  });

  it('tests iconstyle filter', function() {
    expect(iconStyle["01d"]).toBe("wi-day-sunny");
    expect(iconStyle["02d"]).toBe("wi-day-cloudy");
    expect(iconStyle["03d"]).toBe("wi-cloud");
    expect(iconStyle["04d"]).toBe("wi-cloudy");
    expect(iconStyle["09d"]).toBe("wi-day-showers");
    expect(iconStyle["10d"]).toBe("wi-day-rain");
    expect(iconStyle["11d"]).toBe("wi-day-thunderstorm");
    expect(iconStyle["13d"]).toBe("wi-day-snow");
    expect(iconStyle["50d"]).toBe("wi-day-fog");

    expect(iconStyle["01n"]).toBe("wi-day-sunny");
    expect(iconStyle["02n"]).toBe("wi-day-cloudy");
    expect(iconStyle["03n"]).toBe("wi-cloud");
    expect(iconStyle["04n"]).toBe("wi-cloudy");
    expect(iconStyle["09n"]).toBe("wi-day-showers");
    expect(iconStyle["10n"]).toBe("wi-day-rain");
    expect(iconStyle["11n"]).toBe("wi-day-thunderstorm");
    expect(iconStyle["13n"]).toBe("wi-day-snow");
    expect(iconStyle["50n"]).toBe("wi-day-fog");
  });
});
