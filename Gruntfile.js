var browsers = [{
	browserName: 'firefox',
	version: '19',
	platform: 'XP'
}, {
	browserName: 'googlechrome',
	platform: 'XP'
}, {
	browserName: 'googlechrome',
	platform: 'linux'
}, {
	browserName: 'internet explorer',
	platform: 'WIN8',
	version: '10'
}, {
	browserName: 'internet explorer',
	platform: 'VISTA',
	version: '9'
}];


var test_urls = [
	'http://0.0.0.0:9999/test/test.html'
];


module.exports = function(grunt) {
	grunt.initConfig({
		connect: {
			server: {
				options: {
					port: 9001, 
					base: ''
				}
			}
		},
		// https://mylko72.gitbooks.io/grunt/content/watch/intro.html
		watch: {
			js: {
				files: ['src/*.js', 'test/test.html', 'test/test_template.html', 'test/*.js'],
				options: {livereload: true},
				tasks: ['shell:makeTest']
			}
		},
		// https://github.com/sindresorhus/grunt-shell
		shell: {
			makeTest: {
				command: 'make test'
			}
		},
		pkg: grunt.file.readJSON('package.json'),
		'saucelabs-mocha': {
			all: {
				options: {
					username: 'biclen', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
					key: function() {return 'e27a0b1d-c824-4c5f-a8af-b6aef6d9ddc1'},
					urls: test_urls,
					browsers: browsers,
					testname: 'Airbridge Test',
					maxRetries: 3,
					//throttled: 3
				}
			},
			options: {
				force: true
			}
		}
	});

	// Loading dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-saucelabs');

	grunt.registerTask('default', ['connect', 'saucelabs-mocha']);
	grunt.registerTask('dev', ['connect:server', 'watch:js']);
}
