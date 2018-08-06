[![Build Status](https://travis-ci.org/mooeypoo/formurlator.svg?branch=master)](https://travis-ci.org/mooeypoo/formurlator)
[![Coverage Status](https://coveralls.io/repos/github/mooeypoo/formurlator/badge.svg?branch=master)](https://coveralls.io/github/mooeypoo/formurlator?branch=master)

# formurlator

formurlator is a JavaScript library meant to synchronize a set of DOM elements with a query string in the URL.

### This is still in development and is not ready to be used.

## Usage
To use this library, attach it:

```html
<script src="formurlator.oojs.min.js"></script>
```

** Note: If you are using oojs separately, you can attach `formurlator.min.js` alongside oojs library **

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

The above definition will connect to the DOM elements and produce the URL query:
`?name=xx&age=0&color=xx&commute=xx&like=1&workpref=xx`

### Reading limits and preset options from DOM values
Some DOM elements have possible extra definitions that the system can read.

#### Limits for type="number"
To make sure the system follows a limit for an input that handles numbers, you can add the limits in the DOM definition:

```html
<input type="number" min="10" max="120">
```

This will ensure that all values follow the limit. If values in the URL query are outside the limit, they will be corrected to fit inside that limit (if they are above the limit, they will be corrected to be the max, and if they're under the limit they will be corrected to the minimum)

#### Providing preset options
There are several ways to produce the behavior of preset options, by choosing the relevant DOM elements.

##### Using `<select>`
If a DOM element is provided with a select option, only the values provided are considered valid. If a value is produced that is invalid, it is corrected to the first value in the option set.

For example, to have a preset parameter `colors` that only allows the options "red", "blue", "green" and "yellow", you can produce the following DOM:

```html
<select id="input-colors">
	<option value="red">Red</option>
	<option value="blue">Blue</option>
	<option value="green">Green</option>
	<option value="yellow">Yellow</option>
</select>
```
This DOM element, when given to the system, will produce a url parameter `?color=xx` where the value is always one of the given values in the options.

##### Using a radio group
Another option is to use a radio group. The behavior is similar to the select, in that the system will only allow and always correct to a value that already exists as one of the options.

For example, to use the same behavior as before, allowing for parameter `colors` with options "red", "blue", "green" and "yellow", use the following DOM element definition:

```html
<input type="radio" name="color" id="color-red" value="red"><label for="color-red">Red</label>
<input type="radio" name="color" id="color-blue" value="blue"><label for="color-blue">Blue</label>
<input type="radio" name="color" id="color-green" value="green"><label for="color-green">Green</label>
<input type="radio" name="color" id="color-yellow" value="yellow"><label for="color-yellow">Yellow</label>
```
There are two main ways to deliver this to the formurlator system; either by giving a `NodeList`:

```javascript
formurlator.add( { color: document.getElementsByName( 'color' ) } );
```

or as an array of elements
```javascript
formurlator.add( { color: [
	document.getElementById( 'color-red' ),
	document.getElementById( 'color-blue' ),
	document.getElementById( 'color-green' ),
	document.getElementById( 'color-yellow' ),
] } );

```

##### Mutliple values: Using a checkbox group
A checkbox group can provide the feature of having preset options in a multi-selection of values.

**Note: For the moment, all multi-selection values are separated by a comma (,) which means the values themselves cannot include a comma within the value itself.**

The same example from above, with a parameter `color` and values "red", "blue", "green" and "yellow", use the following DOM element definition:

```html
<input type="checkbox" name="color" id="color-red" value="red"><label for="color-red">Red</label>
<input type="checkbox" name="color" id="color-blue" value="blue"><label for="color-blue">Blue</label>
<input type="checkbox" name="color" id="color-green" value="green"><label for="color-green">Green</label>
<input type="checkbox" name="color" id="color-yellow" value="yellow"><label for="color-yellow">Yellow</label>
```

Similarly to the radio group, there are two ways to provide the system with these options; either by giving a `NodeList`:

```javascript
formurlator.add( { color: document.getElementsByName( 'color' ) } );
```

or as an array of elements
```javascript
formurlator.add( { color: [
	document.getElementById( 'color-red' ),
	document.getElementById( 'color-blue' ),
	document.getElementById( 'color-green' ),
	document.getElementById( 'color-yellow' ),
] } );
```

##### Mutliple values: Using a `<select multiple>`
Another method of creating a parameter that allows multiple values from within a preset, you can use the `<select multiple>` element. It works similarly to the `<select>` option but allows for multiple values.

**Note: For the moment, all multi-selection values are separated by a comma (,) which means the values themselves cannot include a comma within the value itself.**

For example, to have a preset parameter `colors` that allows for multiple selection between the options "red", "blue", "green" and "yellow", you can produce the following DOM:
```html
<select id="input-colors" multiple>
	<option value="red">Red</option>
	<option value="blue">Blue</option>
	<option value="green">Green</option>
	<option value="yellow">Yellow</option>
</select>
```
This DOM element, when given to the system, will produce a url parameter `?color=xx,yy,zz` where the values are always from the given values in the options.

### Starting / stopping

By default, the system will start synchronizing immediately. You can stop listening for individual elements by calling `formurlator.stop( [param-name] )`:

```javascript
formurlator.stop( 'name' );
```
This will stop listening to changes (either from the URL or from the DOM) and not synchronize the values to the URL params.

You can start (or start again) listening to an element by calling `formurlator.start( [param-name] );`:

```javascript
formurlator.start( 'name' );
```
This will resume listening to DOM value changes. It will immediately update the URL with the current DOM value, and continue synchronizing the value to the url query.

You can also stop or start the entire system by calling stop and start without parameters:
```javascript
formurlator.stop();
formurlator.start();
```

### Loading elements on 'stop' mode initially
By default, adding elements will immediately synchronize their status with the URL. If you want to change this feature, and have your parameters (or any added ones) first start inert, you can reload the formurlator system with `{ active: false }` configuration:

```javascript
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
