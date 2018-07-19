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
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'src/js/pointFinder.min.js': ['src/js/pointFinder.js'],
                    'src/js/pointFinderGPS.min.js': ['src/js/pointFinderGPS.js'],
                    'src/lib/mhLog/mhlog.min.js': ['src/lib/mhLog/mhlog.js'],
                    'src/lib/mhGeo/mhGeo.min.js': ['src/lib/mhGeo/mhGeo.js']
                }
            }
        },
        jshint: {
            // define the files to lint
            files: ['gruntfile.js', "src/js/pointFinderGPS.js", "src/js/pointFinder.js"],
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

};
