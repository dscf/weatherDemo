describe('appTest', function() {
  var $scope;
  //load module and inject mock service
  beforeEach(module('weatherApp'));

  //initialize injection
  beforeEach(function() {
    inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();

      //to use $controller to initialize the controller instance, you need to pass all the dependencies that it requires.
      $controller("bodyController", {
        $scope: $scope
      });
    });
  });

  it('tests scope variables', function() {
    expect($scope.city).toBe(undefined);
    expect($scope.invalidCity).toBe(false);
  });

  it('tests app config', function() {
    var appCfg;
    inject(function(_appCfg_) {
      appCfg = _appCfg_;
    });

    expect(appCfg.country).toBe("au");
    expect(appCfg.types).toEqual(['(cities)']);
  });
});
