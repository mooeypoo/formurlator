/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	var pkg = grunt.file.readJSON( 'package.json' ),
		customLaunchers = require( './tests/karma.browsers.js' ),
		// Set --no-sandbox for Chrome on Travis.
		// https://docs.travis-ci.com/user/environment-variables/
		// See karma.browser.js for details.
		chromeHeadless = process.env.TRAVIS ? 'ChromeHeadlessNoSandbox' : 'ChromeHeadless';

	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-karma' );
	// grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.initConfig( {
		pkg: pkg,
		eslint: {
			code: {
				src: [
					'src/*.js',
					'!node_modules/**'
				]
			}
		},
		concat: {
			options: {
				// banner: grunt.file.read( 'build/banner.txt' ),
				// Remove wrapping IIFE ( function () {}() );\n
				process: function ( src, path ) {
					if (
						path === 'src/intro.js.txt' ||
						path === 'src/outro.js.txt'
					) {
						return src;
					}
					// Only remove the end if we're removing the starting (function () { ... wrapper
					if ( new RegExp( /^\( function \(\) {/ ).test( src ) ) {
						// eslint-disable-next-line quotes
						src = src
							.replace( /^\( function \(\) {/, '' ) // Beginning of file
							.replace( /}\(\) \);\n$/, '' );
					}
					return src;
				}
			},
			dist: {
				files: {
					'dist/formurlator.js': [
						'src/intro.js.txt',
						'src/fr.js',
						'src/fr.Element.js',
						'src/fr.DOMManager.js',
						'src/fr.Controller.js',
						'src/singleton.js',
						'src/outro.js.txt'
					]
				}
			},
			distWithOOJS: {
				files: {
					'dist/formurlator.oojs.js': [
						'node_modules/oojs/dist/oojs.min.js',
						'dist/formurlator.js'
					]
				}
			}
		},
		uglify: {
			dist: {
				options: {
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
						'<%= grunt.template.today("yyyy-mm-dd") %> */',
					mangle: {
						reserved: [ 'OO', 'fr' ]
					},
					sourceMapIncludeSources: true,
					sourceMap: true
				},
				files: {
					'dist/formurlator.oojs.min.js': [ 'dist/formurlator.oojs.js' ],
					'dist/formurlator.min.js': [ 'dist/formurlator.js' ]
				}
			}
		},
		karma: {
			options: {
				frameworks: [ 'qunit' ],
				files: [
					'node_modules/jquery/dist/jquery.js',
					'node_modules/oojs/dist/oojs.js',
					'src/fr.js',
					'src/fr.Element.js',
					'src/fr.DOMManager.js',
					'src/fr.Controller.js',
					'tests/testrunner.js',
					'tests/unit/*.js'
				],
				reporters: [ 'dots' ],
				customLaunchers: customLaunchers,
				singleRun: true,
				autoWatch: false,
				concurrency: 3,
				captureTimeout: 90000
			},
			// Primary unit test run (includes code coverage)
			main: {
				browsers: [ chromeHeadless ],
				preprocessors: {
					'src/*.js': [ 'coverage' ]
				},
				reporters: [ 'dots', 'coverage' ],
				coverageReporter: {
					instrumenterOptions: {
						istanbul: { noCompact: true }
					},
					// specify a common output directory
					dir: './coverage',
					reporters: [
						{ type: 'html', subdir: 'report-html' },
						{ type: 'lcov', subdir: 'report-lcov' },
						{ type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' }
					],
					// https://github.com/karma-runner/karma-coverage/blob/v1.1.1/docs/configuration.md#check
					check: { global: {
						functions: 100,
						statements: 99,
						branches: 99,
						lines: 99
					} }
				}
			}
		}
	} );

	grunt.registerTask( 'test', [ 'eslint', 'karma:main' ] );
	grunt.registerTask( 'build', [ 'test', 'concat:dist', 'concat:distWithOOJS', 'uglify' ] );
	grunt.registerTask( 'default', 'test' );
};
