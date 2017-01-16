module.exports = function(grunt)
{
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
                    'src/js/pePlayerMain.min.js': ['src/js/pePlayerMain.js'],
                    'src/js/pePlayerModel.min.js': ['src/js/pePlayerModel.js'],
                    'src/js/pePlayerServer.min.js': ['src/js/pePlayerServer.js'],
                    'src/js/pePlayerController.min.js': ['src/js/pePlayerController.js'],
                    'src/js/pePlayerMapController.min.js': ['src/js/pePlayerMapController.js'],
                    'src/js/pePlayerMapFactory.min.js': ['src/js/pePlayerMapFactory.js'],
                    'src/js/markerWithLabel.min.js': ['src/js/markerWithLabel.js'],
                    'src/lib/mhLog/mhlog.min.js': ['src/lib/mhLog/mhlog.js'],
                    'src/lib/mhGeo/mhGeo.min.js': ['src/lib/mhGeo/mhGeo.js']
                }
            }
        },
        jshint: {
            // define the files to lint
            files: ['gruntfile.js', "src/js/pePlayerController.js", "src/js/markerWithLabel.js", "src/js/customSettings.js",
                "src/js/pePlayerMain.js", "src/js/pePlayerModel.js", "src/js/pePlayerServer.js",
                "src/js/pePlayerMapFactory.js", "src/js/pePlayerMapController.js"],
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
                command: 'jsdoc  --destination docs', // FIXME:  need to add files
                options: {
                    stdout: true
                }
            }
        },
        watch: {
            files: ['<%=jshint.files %>'],
            tasks: ['jshint', 'uglify']
        }
    });

    // Load libs
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell');

    // Register the default tasks
    grunt.registerTask('default', ['jshint', 'uglify']);

    // Register building task
    grunt.registerTask('update', ['shell:bower', 'shell:npm', 'copy', 'jshint', 'uglify']);

    // Register documentation task
    grunt.registerTask('docs', ['shell:docs']);

};
