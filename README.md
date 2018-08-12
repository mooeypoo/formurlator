[![Build Status](https://travis-ci.org/mooeypoo/formurlator.svg?branch=master)](https://travis-ci.org/mooeypoo/formurlator)
[![Coverage Status](https://coveralls.io/repos/github/mooeypoo/formurlator/badge.svg?branch=master)](https://coveralls.io/github/mooeypoo/formurlator?branch=master)

# formurlator

formurlator is a JavaScript library meant to synchronize a set of DOM elements with a query string in the URL.

### This is still in development and is not ready to be used.

## Usage

Visit the <a href="https://mooeypoo.github.io/formurlator">demos and documentation page</a> for usage information.

## Bugs and issues
This library is undergoing active development. If you encounter bugs or if you have ideas for improvements, please consider adding them to the [issues](https://github.com/mooeypoo/formurlator/issues) and/or submitting pull requests (see 'contribution' below)

## Contribution
If you want to contribute or to run the development locally:
* Clone the repository
* Run `npm install` and develop to your heart's content.
* Run `grunt test` to run unit tests
* To build the distribution files, run `grunt build`

formurlator depends on [OOJS library](https://github.com/wikimedia/oojs) in production.

In development, jQuery and QUnit are used to run the tests and coverage reports.

## License and Author
Written by Moriel Schottlender, license MIT.
Please feel free to fork, contribute, and submit issues if needed.

## Change Log
### v0.1.1
* Add <code>formurlator.set( name, value )</code> to the public API, allowing to change an element value.
