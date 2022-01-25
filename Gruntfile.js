
const sass  = require('node-sass');
const Fiber = require('fibers');
const path 	= require('path');

/**
* ----------------------------------------
* @description grunt setup (main wrapper)
* ----------------------------------------
*/
module.exports = grunt => {
    'use strict';

	const projectConfig = {
		name: 'bagan-html', 						// should be the text domain of the project (todo: spilt it)
		srcDir: './', 								// the source directory of the plugin
		distDir: './build/',						// where to save the built files
		enableLint:	false, 							// ignore the linting (coding standard checking) during 'build' task (true/ false)
        version: '1.0.0'
	};

	/**
    * -------------------------------------
    * @description Setup project files
    * -------------------------------------
    */
    const projectFiles = {
        sass : [
            {
                cwd: 'sass/',
                src: ['master.scss', '!_*.scss'],
                dest: 'css/'
            },
            
        ],

		ts: [
			{
				cwd: 'src/',
				src: [ 'master.js'],
				dest: 'js/',
			},
			
		],
    }


    /**
    * -------------------------------------
    * @description initalize configuration
    * @see https://software.saao.ac.za/2014/12/03/logging-in-grunt-in-colour/
    * -------------------------------------
    */
    
    grunt.initConfig({
        // grunt watch files
        watch: {
			sass: {
				files: [ projectConfig.srcDir + '**/sass/**/*.scss', '!' + projectConfig.srcDir + 'node_modules' ],
				tasks: [ 'sass', (projectConfig.enableLint ? 'stylelint' : 'screen:noLintError') ] // assign watch task
			},
			js: {
				files: [ projectConfig.srcDir + '**/src/**/*.js', '!' + projectConfig.srcDir + 'node_modules' ],
				tasks: [ 'ts', ( projectConfig.enableLint ? 'stylelint' : 'screen:noLintError' ) ] // assign watch task
			},
		},

        // grunt compile scss to css
        sass: {
            compile: {
				options: {
					implementation: sass,
					sourceMap: true,
					indentType: 'tab',
					omitSourceMapUrl: true,
					indentWidth: 1,
					outputStyle: 'expanded',
					force: true,
                    fiber: Fiber,
				},
				files: projectFiles.sass.map( file => ( {
					expand: true,
					extDot: 'last',
					ext: '.css',
					cwd: file.cwd,
					src: file.src,
					dest: file.dest,
				} ) ),
			},
        },

		webpack: {
			configs: projectFiles.ts.map( value =>
				value.src.map( val => ( {
					mode: 'production',
					entry: path.join( __dirname, projectConfig.srcDir, value.cwd, val ),
					devtool: 'source-map',
					module: {
						rules: [
							/*
							TypeScript to JS Rule
							-------------------------*/ 
							{
								test: /\.tsx?$/,
								use: 'ts-loader',
								exclude: /node_modules/,
							},
							/*
							SCSS Loader
							-------------------------*/
							{
								test: /\.s[ac]ss$/i,
								use: [
								// Creates `style` nodes from JS strings
								"style-loader",
								// Translates CSS into CommonJS
								"css-loader",
								// Compiles Sass to CSS
								"sass-loader",
								],
							}
						] 
					},

					resolve: {
						extensions: ['.tsx', '.ts', '.js'],
					},

					output: {
						path: path.resolve( __dirname, projectConfig.srcDir, value.dest ),
						filename: 'index.js',
					},
				} ),
				) ).flat( 1 ),
		},

        // stylelint scss file
        stylelint: {
			options: {
				fix: true,
				configFile: '.stylelintrc',
			},
			default: [ projectConfig.srcDir + '**/*.scss' ],
		},

		makepot: {
			target: {
				options: {
					cwd: projectConfig.srcDir,  // Directory of files to internationalize.
					domainPath: 'languages/',   // Where to save the POT file.
					mainFile: '', 				// Main project file.
					type: 'wp-theme', 			// Type of project (wp-plugin or wp-theme).
					updateTimestamp: false, 	// Whether the POT-Creation-Date should be updated without other changes.
					updatePoFiles: false, 		// Whether to update PO files in the same directory as the POT file.
				},
			},
		},

        // check textdomain
		checktextdomain: {
			standard: {
				options: {
					text_domain: projectConfig.name, //Specify allowed domain(s)
					// correct_domain: true, // don't use it, it has bugs
					keywords: [ //List keyword specifications
						'__:1,2d',
						'_e:1,2d',
						'_x:1,2c,3d',
						'esc_html__:1,2d',
						'esc_html_e:1,2d',
						'esc_html_x:1,2c,3d',
						'esc_attr__:1,2d',
						'esc_attr_e:1,2d',
						'esc_attr_x:1,2c,3d',
						'_ex:1,2c,3d',
						'_n:1,2,4d',
						'_nx:1,2,4c,5d',
						'_n_noop:1,2,3d',
						'_nx_noop:1,2,3c,4d',
					],
				},
				files: [ {
					src: [
						projectConfig.srcDir + '**/*.php',
						'!' + projectConfig.srcDir + 'node_modules/**',
					], //all php
					expand: true,
				} ],
			},
		},

		// clean dist directory file
		clean: {
			options: { force: true },
			dist: [
				projectConfig.distDir + '/**',
				projectConfig.distDir.replace( /\/$/, '' ) + '.zip',
			],
		},

		// Copying project files to ../dist/ directory
		copy: {
			dist: {
				files: [ {
					expand: true,
					src: [
						'' + projectConfig.srcDir + '**',
						'!' + projectConfig.srcDir + 'Gruntfile.js',
						'!' + projectConfig.srcDir + 'package.json',
						'!' + projectConfig.srcDir + 'package-lock.json',
						'!' + projectConfig.srcDir + 'node_modules/**',
						'!' + projectConfig.srcDir + '**/dev-*/**',
						'!' + projectConfig.srcDir + '**/*-test/**',
						'!' + projectConfig.srcDir + '**/*-beta/**',
						'!' + projectConfig.srcDir + '**/scss/**',
						'!' + projectConfig.srcDir + '**/sass/**',
						'!' + projectConfig.srcDir + '**/src/**',
						'!' + projectConfig.srcDir + '**/.*',
						'!' + projectConfig.srcDir + '**/*.map',
						'!' + projectConfig.srcDir + '**/*.config',
						'!' + projectConfig.srcDir + 'tsconfig.json',
						'!' + projectConfig.srcDir + 'build-package/**',
						'!' + projectConfig.srcDir + 'none',
						'!' + projectConfig.srcDir + 'Built',
						'!' + projectConfig.srcDir + 'Installable',
					],
					dest: projectConfig.distDir,
				} ],
			},
		},

		// Minify all .js files.
		terser: {
			options: {
				ie8: true,
				parse: {
					strict: false,
				},
			},
			js: {
				files: [ {
					expand: true,
					src: [ projectConfig.distDir + '**/*.js' ],
					dest: '',
				} ],
			},
		},

		// Minify all .css files.
		cssmin: {
			options: {
				force: true,
				compress: true,
				sourcemaps: false,
			},
			minify: {
				files: [ {
					expand: true,
					src: [ projectConfig.distDir + '**/*.css' ],
					dest: '',
				} ],
			},
		},
		
		// Compress Build Files into ${project}.zip
		compress: {
			dist: {
				options: {
					force: true,
					mode: 'zip',
					archive: projectConfig.distDir.replace( projectConfig.name, '' ) + projectConfig.name  + '-' + projectConfig.version + '.zip',
				},
				expand: true,
				cwd: projectConfig.distDir,
				src: [ '**' ],
				dest: '../' + projectConfig.name,
			},
		},

/**
* -------------------------------------
* @description print ASCII text 
* @see https://fsymbols.com/generators/carty/
* -------------------------------------
*/
		
screen: {
    begin: `
	# Project   : ${projectConfig.name}
	# Dist      : ${projectConfig.distDir}
	# Version   : ${projectConfig.version}`.cyan,
	noLintError: `
------------------------------------------------------
	Linting is not enabled for this project.
------------------------------------------------------`.red,
	textdomainchecking: `
---------------------------------------------------
	Checking textdomain [${projectConfig.name}]
---------------------------------------------------`.cyan,
	minifying:`
--------------------------------------
	Minifying js & css files.
---------------------------------------`.cyan,
	finish: `
╭─────────────────────────────────────────────────────────────────╮
│                                                                 │
│                      All tasks completed.                       │
│   Built files & Installable zip copied to the dist directory.   │
│                        ~ A S H R A F ~                          │
│                                                                 │
╰─────────────────────────────────────────────────────────────────╯
`.green

}

    });
    
    /**
    * ----------------------------------
    * @description Register grunt tasks 
    * ----------------------------------
    */
    require('load-grunt-tasks')(grunt);
    grunt.registerMultiTask( 'screen', function() { grunt.log.writeln( this.data ) });
	grunt.registerTask( 'ts', ['webpack'] );
	grunt.registerTask( 'boot', ['clean', 'copy'] );
	grunt.registerTask( 'minify', ['screen:minifying','terser:js','cssmin'] );
    grunt.registerTask( 'default', ['screen:begin', (projectConfig.enableLint ? 'stylelint': 'screen:noLintError'), 'sass', 'ts', 'watch']);
	grunt.registerTask( 'build', ['screen:begin', (projectConfig.enableLint ? 'stylelint': 'screen:noLintError'), 'sass', 'ts', 'makepot', 'boot', 'minify', 'compress', 'screen:finish'])
    
};