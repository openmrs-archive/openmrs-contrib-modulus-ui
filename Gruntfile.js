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

    colorguard: {
      files: {
        src: 'app/css/*.css'
      }
    },

    connect: {
      development: {
        options: {
          port: process.env.PORT || 8083,
          base: './app',
          livereload: 3333,

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
      templates: {
        files: 'app/**/*.html',
        options: {
          livereload: true
        }
      },
      config: {
        files: 'config/modulusui*.conf.js',
        tasks: 'config',
        options: {
          livereload: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-colorguard')

  grunt.registerTask('default', ['build'])
  grunt.registerTask('serve', ['build', 'connect:development', 'watch'])
  grunt.registerTask('heroku', ['connect:heroku'])
  grunt.registerTask('build', ['config', 'less', 'colorguard'])

  grunt.registerTask('config', function() {

    var config = require('./config/modulusui.conf.js');
    var env = {
      conf: process.env.MODULUS_UI_CONF || process.env.bamboo_MODULUS_UI_CONF,
      base: process.env.MODULUS_API_BASE_URL ||
        process.env.bamboo_MODULUS_API_BASE_URL,
      readOnly: process.env.MODULUS_API_READ_ONLY ||
        process.env.bamboo_MODULUS_API_READ_ONLY
    };

    grunt.log.writeln("Including config from modulusui.conf.js");

    if (grunt.file.exists('./config/modulusui-dev.conf.js')) {
      grunt.log.writeln("Including config from modulusui-dev.conf.js");
      var devConfig = require('./config/modulusui-dev.conf.js');
      config = _.assign(config, devConfig);
    }

    if (env.conf) {
      try {
        var override = JSON.parse(env.conf);
        grunt.log.writeln("Including config from environment in MODULUS_UI_CONF");
        config = _.merge(config, override);
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

    var contents = "angular.module('modulusOne.config', []).constant('Config', " +
      JSON.stringify(config) + ");"
    grunt.file.write('app/js/config.js', contents);

    grunt.log.writeln("Wrote current configuration to app/js/config.js");
  })
}