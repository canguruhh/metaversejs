module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: './dist/result.txt',
                    quiet: false,
                    timeout: 10000,
                    clearRequireCache: false,
                    noFail: false
                },
                src: ['./test/*.js']
            }
        },
        browserify: {
            all: {
                options: {
                    browserifyOptions: {
                        standalone: 'Metaverse'
                    }
                },
                src: ['./index.js'],
                dest: './dist/metaverse.js',
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: [[
                    "@babel/preset-env",
                    {
                        "corejs": "3",
                        "useBuiltIns": "entry"
                    }
                ]]
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
                dest: './dist/metaverse.min.js',
                options: {
                    mangle: {
                        reserved: ['BigInteger', 'ECPair', 'Point']
                    }
                }
            }
        }

    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['mochaTest', 'browserify', 'babel', 'uglify']);
};
