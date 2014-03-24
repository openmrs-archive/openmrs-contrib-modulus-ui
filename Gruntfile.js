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
      }
    },

    template: {
      'index-html': {
        options: {
          data: {
            modulusApiBaseUrl: process.env.MODULUS_API_BASE_URL || '/api',
            publicBaseUrl: process.env.MODULUS_UI_PUBLIC_BASE_URL || '/'
          }
        },
        files: {
          'app/index.html': ['app/index.html.template']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-template')

  grunt.registerTask('default', ['build'])
  grunt.registerTask('serve', ['build', 'connect:development', 'watch'])
  grunt.registerTask('heroku', ['connect:heroku'])
  grunt.registerTask('build', ['template', 'less'])
}