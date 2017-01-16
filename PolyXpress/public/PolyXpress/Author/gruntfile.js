module.exports = function(grunt) {
    // Configure Grunt
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components/mhLog/',
                        src: ['mhlog.js'],
                        dest: 'src/lib/mhLog',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/mhGeo/',
                        src: ['mhGeo.js'],
                        dest: 'src/lib/mhGeo',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/inject/dist/',
                        src: ['inject*.js'],
                        dest: 'src/lib/inject',
                        filter: 'isFile'
                    }
                ]
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
				mangle: {
					except: ['require', 'module', 'exports']
				}
            },
            dist: {
                files: {
                    'src/js/peDesignerMain.min.js': ['src/js/peDesignerMain.js'],
                    'src/js/peDesignerModel.min.js': ['src/js/peDesignerModel.js'],
                    'src/js/peDesignerServer.min.js': ['src/js/peDesignerServer.js'],
                    'src/js/peDesignerController.min.js': ['src/js/peDesignerController.js'],
                    'src/lib/mhLog/mhlog.min.js': ['src/lib/mhLog/mhlog.js']
                }
            }
        },
        jshint: {
            // define the files to lint
            files: ['gruntfile.js', "src/js/peDesignerController.js",
                "src/js/peDesignerMain.js", "src/js/peDesignerModel.js", "src/js/peDesignerServer.js"],
            // configure JSHint (http://www.jshint.com/docs/)
            options: {
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        shell: {
            bower: {
                command: 'bower update',
                options: {
                    stdout: true
                }
            },
            npm: {
                command: 'npm update',
                options: {
                    stdout: true
                }
            },
			docs: {
				command: 'jsdoc src/js/peDesignerController.js src/js/peDesignerModel.js src/js/peDesignerServer.js --destination docs',
				options: {
					stdout: true
				}
            },
            istanbul: {
                command: 'istanbul cover _mocha --  ../../../../NetBeans/PolyXpressAuthor/test/functional/ -R spec',
                options: {
                    stdout: true
                }
            }
        },
        watch: {
            test: {
                options: {
                    spawn: false // So watch actually works!
                },
                files: ['**/*.js'],
                tasks: ['mochaTest']
            },
            options: {
                spawn: false // So watch actually works!
            },
            files: ['<%=jshint.files %>', '**/*.js'],
            tasks: ['jshint', 'uglify']
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    clearRequireCache: true // So watch actually works!
                },
                src: ['../../../../NetBeans/PolyXpressAuthor/test/functional/*.js']
            }
        },
        coverage: {
        	options: {
                    spawn: false // So watch actually works!
                },
                files: ['**/*.js'],
                tasks: ['shell:istanbul']
            }
    });

    var defaultTestSrc = grunt.config('mochaTest.test.src');
    grunt.event.on('watch', function(action, filepath) {
        grunt.config('mochaTest.test.src', defaultTestSrc);
        if (filepath.match('test/functional')) {
          grunt.config('mochaTest.test.src', filepath);
        }
    });

    // Load libs
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-shell');

    // Register the default tasks
    grunt.registerTask('default', ['jshint', 'uglify']);

    // Register building task
    grunt.registerTask('update', ['shell:bower', 'shell:npm', 'copy', 'jshint', 'uglify']);

    // Register documentation task
    grunt.registerTask('docs', ['shell:docs']);
    // Register the mocha test task
    grunt.registerTask('test', ['mochaTest', 'watch:test']);

    // Register the code coverage task
    grunt.registerTask('test_with_coverage', ['shell:istanbul', 'watch:coverage']);
};
