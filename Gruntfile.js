/* eslint-env node */
module.exports = function Gruntfile( grunt ) {
	var pkg = grunt.file.readJSON( 'package.json' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

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
				process: function ( src, filepath ) {
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
						// 'src/_start.urlp.js',
						// 'src/urlp.js',
						// 'src/urlp.Parameter.js',
						// 'src/urlp.Element.js',
						// 'src/urlp.Model.js',
						// 'src/urlp.View.js',
						// 'src/urlp.Controller.js',
						// 'src/_end.urlp.js'
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
					// banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
					// 	'<%= grunt.template.today("yyyy-mm-dd") %> */',
					mangle: {
						reserved: [ 'OO' ]
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
		qunit: {
			all: [ 'test/index.html' ]
		}
	} );

	grunt.registerTask( 'test', [ 'eslint', 'qunit' ] );
	grunt.registerTask( 'build', [ 'test', 'concat:dist', 'concat:distWithOOJS', 'uglify' ] );
	grunt.registerTask( 'default', 'test' );
};
