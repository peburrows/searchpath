/*global module:false require:false*/

module.exports = function(grunt) {
  var files = ["v1.js"]
    , libAndTest  = files.slice(0);
    libAndTest.push('test/src/**/*.coffee');

  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON('package.json'),
      banner: '/*! searchpath.js - v<%= meta.pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= meta.pkg.author %> */\n' +
        '<%= meta.pkg.license %> License\n'
    },
    lint: {
      files: ['Gruntfile.js', 'v1.js']
    },

    coffee: {
      tests: {
        expand: true,
        cwd: 'test/src/',
        src: '**/*.coffee',
        dest: 'test/lib/',
        ext: '.js'
      }
    },

    // concat: {
    //   options: {
    //     banner: "<%= meta.banner %>"
    //   },
    //   dist: {
    //     src: files,
    //     dest: 'lib/build/searchpath.js'
    //   }
    // },


    watch: {
      tests: {
        files: libAndTest,
        tasks: ['coffee:tests', 'testOnly']
      },
      app: {
        files: files,
        tasks: ['default']
      }
    },

    jasmine: {
      options: {
        specs: 'test/lib/**/*.js',
        helpers: ['test/helpers/jasmine-jquery.js'],
        template: 'test/template.tmpl'
      },
      src: files
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        laxcomma: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        jquery: true,
        loopfunc: true,
        evil: true
      },
      globals: {
        'Searchpath': false,
        'console': false
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        files: {
          'v1.min.js': 'v1.js'
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['coffee:tests', 'jasmine']);
  grunt.registerTask('testOnly', ['jasmine']);

  // Default task.
  grunt.registerTask('default', ['uglify']);

};
