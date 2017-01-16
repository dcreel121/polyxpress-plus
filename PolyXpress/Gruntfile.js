module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    node: true,
                    module: true
                }
            }
        },
        grunt: {
            updatePlayer: {
                gruntfile: 'public/PolyXpress/Player/gruntfile.js',
                task: 'update'
            },
            updateDesigner: {
                gruntfile: 'public/PolyXpress/Author/gruntfile.js',
                task: 'update'
            }
        },
        shell: {
            npmUpdate: {
                command: 'npm update',
                options: {
                    stdout: true
                }
            },
            startNode: {
                command: 'npm start',
                options: {
                    stdout: true
                }
            },
            stopNode: {
                command: 'npm stop',
                options: {
                    stdout: true
                }
            },
            cfSetTargetDev: {
                command: 'cf target -s development',
                options: {
                    stdout: true
                }
            },
            cfSetTargetProd: {
                command: 'cf target -s production',
                options: {
                    stdout: true
                }
            },
            cfPush: {
                command: 'cf push px',
                options: {
                    stdout: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-grunt');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['jshint', 'shell:npmUpdate']);

    // update everything, prepare for release, push to pivotal
    grunt.registerTask('deployDev', ['jshint', 'shell:npmUpdate', 'grunt:updatePlayer', 'grunt:updateDesigner', 'shell:cfSetTargetDev', 'shell:cfPush']);
    grunt.registerTask('deployProd', ['jshint', 'shell:npmUpdate', 'grunt:updatePlayer', 'grunt:updateDesigner', 'shell:cfSetTargetProd', 'shell:cfPush']);

};
