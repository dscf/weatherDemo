module.exports = function(grunt) {
  var src = ['app/app.js'];
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
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            
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
