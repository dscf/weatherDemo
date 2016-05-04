module.exports = function(grunt) {
  var src = ['main/app.js'];
  var testSrc = ['test/*js'];
  var all = src.concat(testSrc);
  grunt.initConfig({
    watch: {
      scripts: {
        files: all,
        tasks: ['jshint', 'karma']
      },
    },
    jshint: {
      options: {
        strict: false,
        devel: true,
        sub: true,
        globals: {
          angular: true
        }
      },
      files: all
    },
    karma: {
      unit: {
        options: {
          files: [
            'main/bower_components/angular/angular.js',
            'main/bower_components/angular-mocks/angular-mocks.js',
            'main/bower_components/jquery/dist/jquery.min.js',
            'main/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'main/manual_components/googlemaps/googleplace.js',

            {pattern: 'test/*.json', watched: true, served: true, included: false}
          ].concat(all),
          frameworks: ['jasmine'],
          singleRun: true,
          browsers: ['PhantomJS2'],
          browserNoActivityTimeout: 60000
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma']);

  grunt.registerTask('dev', ['watch']);

};
