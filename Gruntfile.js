module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: './dist/result.txt',
                    quiet: false,
                    clearRequireCache: false, 
                    noFail: false
                },
                src: ['./test/*.js']
            }
        },
        browserify: {
            './dist/metaverse.js': ['./index.js']
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['env']
            },
            dist: {
                files: {
                    './dist/metaverse.js': './dist/metaverse.js'
                }
            }
        },
        uglify: {
            js: {
                src: ['./dist/metaverse.js'],
                dest: './dist/metaverse.min.js'
            }
        }

    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test');
    
    grunt.registerTask('default', ['mochaTest', 'browserify', 'babel', 'uglify']);
};
