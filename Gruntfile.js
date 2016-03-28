'use strict';
module.exports = function(grunt) {

  var imageminConf = function(app) {
    return {
      expand: true,
      cwd: app.root,
      src: 'images/**/*.{png,jpg,jpeg}',
      dest: app.dist,
    };
  };
  
  grunt.initConfig({
    imagemin: {
      app: {
        files: [
          imageminConf({
            root: '',
            dest: ''
          })
        ]
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  
  grunt.registerTask('build', [
    'imagemin'
  ]);
  
};
