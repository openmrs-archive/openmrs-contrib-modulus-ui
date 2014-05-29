var _ = require('lodash');

module.exports = function(grunt) {
  grunt.initConfig  ({

    less: {
      options: {
        ieCompat: true
      },
      files: {
        expand: true,
        cwd: 'app/less/',
        src: '*.less',
        dest: 'app/css/',
        ext: '.css'
      }
    },

    connect: {
      development: {
        options: {
          port: process.env.PORT || 8083,
          base: './app',
          livereload: true,

          middleware: function(connect, options, middlewares) {
            var morgan = require('morgan')

            middlewares.unshift(morgan('dev'))
            return middlewares;
          }
        }
      },
      heroku: {
        options: {
          port: process.env.PORT,
          base: './app',
          keepalive: true
        }
      }
    },

    watch: {
      css: {
        files: 'app/less/*.less',
        tasks: ['less'],
        options: {
          livereload: true
        }
      },
      template: {
        files: 'app/index.html.template',
        tasks: ['template']
      },
      config: {
        files: 'config/modulusui.conf.js',
        tasks: 'config'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-connect')

  grunt.registerTask('default', ['build'])
  grunt.registerTask('serve', ['build', 'connect:development', 'watch'])
  grunt.registerTask('heroku', ['connect:heroku'])
  grunt.registerTask('build', ['config', 'less'])

  grunt.registerTask('config', function() {

    var config = require('./config/modulusui.conf.js');
    var env = {
      conf: process.env.MODULUS_UI_CONF || process.env.BAMBOO_MODULUS_UI_CONF,
      base: process.env.MODULUS_API_BASE_URL ||
        process.env.BAMBOO_MODULUS_API_BASE_URL,
      readOnly: process.env.MODULUS_API_READ_ONLY ||
        process.env.BAMBOO_MODULUS_API_READ_ONLY
    };


    if (env.conf) {
      try {
        var override = JSON.parse(env.conf);
        config = _.assign(config, override);
      } catch (error) {
        grunt.log.error("Failed to parse configuration in MODULUS_UI_CONF " +
          "environment variable.");
      }
    }

    if (env.base) {
      config.api.baseUrl = env.base;
    }

    if (env.readOnly) {
      config.api.readOnly = env.readOnly;
    }

    var contents = "angular.module('modulusOne').constant('Config', " +
      JSON.stringify(config) + ");"
    grunt.file.write('app/js/config.js', contents);

    grunt.log.writeln("Wrote current configuration to app/js/config.js");
  })
}