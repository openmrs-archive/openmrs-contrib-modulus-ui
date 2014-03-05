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
      server: {
        options: {
          port: 8083,
          base: './app',
          keepalive: 'true'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-connect')

  grunt.registerTask('default', ['less'])
  grunt.registerTask('serve', ['less', 'connect'])
}