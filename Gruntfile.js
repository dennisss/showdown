/**
 * Created by Tivie on 12-11-2014.
 */

module.exports = function (grunt) {

  if (grunt.option('q') || grunt.option('quiet')) {
    require('quiet-grunt');
  }

  // Project configuration.
  var config = {
    pkg: grunt.file.readJSON('package.json'),

    shell: {
      dist: './node_modules/.bin/webpack',
      test: './node_modules/.bin/tsc -p tsconfig.node.json'
    },

    clean: ['.build/'],

    endline: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js',
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.min.js'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporterOutput: ''
      },
      files: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js'
      ]
    },

    eslint: {
      options: {
        config: '.eslintrc.json'
      },
      target: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js'
      ]
    },

    tslint: {
      options: {
        configuration: 'tslint.json'
      },
      target: [
        'src/**/*.ts',
        'test/**/*.ts'
      ]
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: 'angular'
        }
      },
      release: {
        src: 'CHANGELOG.md'
      }
    },

    conventionalGithubReleaser: {
      release: {
        options: {
          auth: {
            type: 'oauth',
            token: process.env.GH_TOEKN
          },
          changelogOpts: {
            preset: 'angular'
          }
        }
      }
    },

    simplemocha: {
      functional: {
        src: 'test/functional/**/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: true,
          reporter: 'spec'
        }
      },
      unit: {
        src: 'test/unit/**/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: true,
          reporter: 'spec'
        }
      },
      single: {
        src: 'test/node/**/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          reporter: 'spec'
        }
      }
    }
  };

  grunt.initConfig(config);

  /**
   * Load common tasks for legacy and normal tests
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-endline');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');

  /**
   * Generate Changelog
   */
  grunt.registerTask('generate-changelog', function () {
    'use strict';
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-conventional-github-releaser');
    grunt.task.run('conventionalChangelog');
  });

  /**
   * Lint tasks
   */
  grunt.registerTask('lint', function () {
    'use strict';
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.task.run('jshint', 'eslint', 'tslint');
  });

  /**
   * Performance task
   */
  grunt.registerTask('performancejs', function () {
    'use strict';
    var perf = require('./test/performance/performance.js');
    perf.runTests();
    perf.generateLogs();
  });

  /**
   * Run a single test
   */
  grunt.registerTask('single-test', function (grep) {
    'use strict';
    grunt.config.merge({
      simplemocha: {
        single: {
          options: {
            grep: grep
          }
        }
      }
    });

    grunt.task.run(['lint', 'shell:test', 'simplemocha:single', 'clean']);
  });

  /**
   * Tasks
   */

  grunt.registerTask('test', ['clean', 'lint', 'shell:test', 'simplemocha:unit', 'simplemocha:functional', 'clean']);
  grunt.registerTask('test-functional', ['shell:test', 'simplemocha:functional', 'clean']);
  grunt.registerTask('test-unit', ['shell:test', 'simplemocha:unit', 'clean']);
  grunt.registerTask('performance', ['shell:test', 'performancejs', 'clean']);
  grunt.registerTask('build', ['test', 'shell:dist', 'uglify', 'endline']);
  grunt.registerTask('build-without-test', ['shell:dist', 'uglify', 'endline']);
  grunt.registerTask('prep-release', ['build', 'generate-changelog']);

  // Default task(s).
  grunt.registerTask('default', ['test']);
};
