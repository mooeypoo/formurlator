/* eslint-env node */

/**
 * Custom launchers for Karma
 *
 * See also https://karma-runner.github.io/1.0/config/browsers.html
 */
module.exports = {
	ChromeHeadlessNoSandbox: {
		base: 'ChromeHeadless',
		flags: [ '--no-sandbox' ]
	}
};
