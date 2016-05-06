module.exports = function(grunt) {
  var src = ['public/app.js'];
  var apiSrc = ['server.js', 'api/*js'];
  var testSrc = ['test/*js'];
  var all = src.concat(testSrc).concat(apiSrc);
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
            'public/bower_components/angular/angular.js',
            'public/bower_components/angular-mocks/angular-mocks.js',
            'public/bower_components/jquery/dist/jquery.min.js',
            'public/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'public/manual_components/googlemaps/googleplace.js',
            'public/manual_components/raphael/raphael.min.js',
            'public/manual_components/morris/morris.min.js',

            {pattern: 'test/*.json', watched: true, served: true, included: false}
          ].concat(src).concat(testSrc),
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
