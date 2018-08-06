[![Build Status](https://travis-ci.org/mooeypoo/formurlator.svg?branch=master)](https://travis-ci.org/mooeypoo/formurlator)
[![Coverage Status](https://coveralls.io/repos/github/mooeypoo/formurlator/badge.svg?branch=master)](https://coveralls.io/github/mooeypoo/formurlator?branch=master)

# formurlator

formurlator is a JavaScript library meant to synchronize a set of DOM elements with a query string in the URL.

### This is still in development and is not ready to be used.

## Usage
To use this library, attach it:
```html
<script src="../dist/formurlator.oojs.min.js"></script>
```
You must define the DOM elements with their query parameters before the system can synchronize the values. To do that, add on initialization:
```javascript
formurlator.add( {
	name: document.getElementById( 'name' ),
	age: document.getElementById( 'age' ),
	color: document.getElementById( 'color' ),
	commute: document.getElementById( 'commute' ),
	like: document.getElementById( 'like' ),
	workpref: document.getElementsByName( 'workpref' )
} );
```
The allowed definition is either a single `Element`, a `NodeList` or an Array of `Element`s.

### Starting / stopping

By default, the system will start synchronizing immediately. You can stop listening for individual elements by calling `formurlator.stop( [param-name] )`:

```
formurlator.stop( 'name' );
```
This will stop listening to changes (either from the URL or from the DOM) and not synchronize the values to the URL params.

You can start (or start again) listening to an element by calling `formurlator.start( [param-name] );`:
```
formurlator.start( 'name' );
```
This will resume listening to DOM value changes. It will immediately update the URL with the current DOM value, and continue synchronizing the value to the url query.

You can also stop or start the entire system by calling stop and start without parameters:
```
formurlator.stop();
formurlator.start();
```

### Loading elements on 'stop' mode initially
By default, adding elements will immediately synchronize their status with the URL. If you want to change this feature, and have your parameters (or any added ones) first start inert, you can reload the formurlator system with `{ active: false }` configuration:

```
formurlator.reload( { active: false } );
```
This will reload formurlator in a state where any .add() method will start in inert ('stop') mode, and will require you to specifically state `formurlator.start()` without parameters to start the entire parameter-set or for each individual parameter.

This might be a good solution in case you have several scripts that initialize, change DOM values or change the URL before you want to start the synchronization.

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
