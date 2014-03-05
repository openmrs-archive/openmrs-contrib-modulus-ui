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
    }
  })

  grunt.loadNpmTasks('grunt-contrib-less')

  grunt.registerTask('default', ['less'])
}