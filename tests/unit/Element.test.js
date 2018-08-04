( function () {
	var $name = $( $.parseHTML( '<input id="firstName" type="text" placeholder="First name">' ) ),
		$age = $( $.parseHTML( '<input id="age" type="number">' ) ),
		$ageWithBothLimits = $( $.parseHTML( '<input id="age" type="number" min="10" max="120">' ) ),
		$ageWithMinLimit = $( $.parseHTML( '<input id="age" type="number" min="10">' ) ),
		$ageWithMaxLimit = $( $.parseHTML( '<input id="age" type="number" max="120">' ) ),
		$color = $( $.parseHTML(
			'<select id="color">' +
				'<option value="yellow">Yellow</option>' +
				'<option value="green" selected>Green</option>' +
				'<option value="blue">Blue</option>' +
				'<option value="red">Red</option>' +
			'</select>'
		) ),
		$transit = $( $.parseHTML(
			'<select id="transit" multiple>' +
				'<option value="car">Car</option>' +
				'<option value="bus" selected>Bus</option>' +
				'<option value="subway">Subway</option>' +
				'<option value="bike">Bike</option>' +
			'</select>'
		) ),
		$like = $( $.parseHTML( '<input id="like" type="checkbox" checked>' ) ),
		workprefArray = [
			$( $.parseHTML( '<input id="workpref-day" name="workpref" value="day" type="radio">' ) )[ 0 ],
			$( $.parseHTML( '<input id="workpref-night" name="workpref" value="night" type="radio">' ) )[ 0 ],
			$( $.parseHTML( '<input id="workpref-any" name="workpref" value="any" type="radio">' ) )[ 0 ]
		],
		clothesArray = [
			$( $.parseHTML( '<input id="clothes-jeans" name="clothes" value="jeans" type="checkbox">' ) )[ 0 ],
			$( $.parseHTML( '<input id="clothes-flanel" name="clothes" value="flanel" type="checkbox">' ) )[ 0 ],
			$( $.parseHTML( '<input id="clothes-cotton" name="clothes" value="cotton" type="checkbox">' ) )[ 0 ]
		];

	QUnit.module( 'fr.Element' );

	QUnit.test( 'Initialization', function ( assert ) {
		var cases = [
			{
				element: $name.clone()[ 0 ],
				expectedType: 'text',
				msg: 'Regular text input initialized with correct type.'
			},
			{
				element: $age.clone()[ 0 ],
				expectedType: 'number',
				msg: 'Number input initialized with correct type.'
			},
			{
				element: $ageWithBothLimits.clone()[ 0 ],
				expectedType: 'number',
				msg: 'Number input initialized with correct type.'
			},
			{
				element: $color.clone()[ 0 ],
				expectedType: 'select-one',
				expectedOptions: [ 'yellow', 'green', 'blue', 'red' ],
				msg: 'Select-one initialized correctly'
			},
			{
				element: $transit.clone()[ 0 ],
				expectedType: 'select-multiple',
				expectedOptions: [ 'car', 'bus', 'subway', 'bike' ],
				msg: 'Select-multiple initialized with correct type.'
			},
			{
				element: $like.clone()[ 0 ],
				expectedType: 'checkbox',
				msg: 'Checkbox initialized with correct type.'
			},
			{
				element: workprefArray.slice( 0 ),
				expectedType: 'radio-group',
				expectedOptions: [ 'day', 'night', 'any' ],
				msg: 'Radio group initialized with correct type.'
			},
			{
				element: clothesArray.slice( 0 ),
				expectedType: 'checkbox-group',
				expectedOptions: [ 'jeans', 'flanel', 'cotton' ],
				msg: 'Checkbox group initialized with correct type.'
			}
		];

		cases.forEach( function ( testCase ) {
			var element = new fr.Element( testCase.element );

			assert.equal(
				element.getType(),
				testCase.expectedType,
				testCase.msg
			);

			if ( testCase.expectedOptions ) {
				assert.deepEqual(
					element.getOptionValues(),
					testCase.expectedOptions,
					testCase.msg + ' (Options: ' + testCase.expectedOptions.join( ', ' ) + ')'
				);
			}
		} );
	} );

	QUnit.test( 'Initialization with error', function ( assert ) {
		assert.throws(
			function () {
				// eslint-disable-next-line no-unused-vars
				var el = new fr.Element( [
					$.parseHTML( '<input type="text">' )[ 0 ],
					$.parseHTML( '<input type="text">' )[ 0 ],
					$.parseHTML( '<input type="text">' )[ 0 ]
				] );
			},
			Error,
			'Invalid element array group throws an error'
		);
	} );

	QUnit.test( 'normalizeValue', function ( assert ) {
		var cases = [
			{
				element: $name.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 'foo', 'foo', 'Preserve string' ],
					[ 123, '123', 'Number to string' ],
					[ '124', '124', 'Preserve numeric string' ]
				]
			},
			{
				element: $age.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 123, 123, 'Preserve valid number' ],
					[ 'foo', 0, 'Invalid (string) returns 0' ],
					[ '123', 123, 'Numeric string casted to number' ]
				]
			},
			{
				element: $ageWithBothLimits.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 42, 42, '(with limits) Preserve valid number' ],
					[ 'foo', 10, 'Invalid (string) returns minimum value' ],
					[ 0, 10, '(with limits) Under the limit - return minimum' ],
					[ 10, 10, '(with limits) Exactly the minimum, return same' ],
					[ 120, 120, '(with limits) Exactly the maximum, return same' ],
					[ 999, 120, '(with limits) Over the limit - return maximum' ]
				]
			},
			{
				element: $ageWithMinLimit.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 42, 42, '(with min) Preserve valid number' ],
					[ 'foo', 10, 'Invalid (string) returns minimum value' ],
					[ 0, 10, '(with min) Under the limit - return minimum' ],
					[ 10, 10, '(with min) Exactly the minimum, return same' ],
					[ 999, 999, '(with min) There is no max; use same number' ]
				]
			},
			{
				element: $ageWithMaxLimit.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 42, 42, '(with max) Preserve valid number' ],
					[ 'foo', 0, 'Invalid (string) returns 0' ],
					[ -999, -999, '(with max) No minimum, return same number' ],
					[ '120', 120, '(with max) Exactly the maximum, return same' ],
					[ 999, 120, '(with max) Above max, return maximum value' ]
				]
			},
			{
				element: $color.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 'blue', 'blue', 'Preserve value that is in options' ],
					[ 'foo', 'yellow', 'Invalid option normalizes to first option value' ]
				]
			},
			{
				element: $transit.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 'subway', [ 'subway' ], 'Valid value is displayed within array' ],
					[ [ 'subway', 'bus' ], [ 'subway', 'bus' ], 'Valid array preserved' ],
					[ [ 'subway', 'foo', 'bus' ], [ 'subway', 'bus' ], 'Invalid values are removed from array' ],
					[ [ 'subway', 'bus', 'subway' ], [ 'subway', 'bus' ], 'Duplicate values are removed from array' ],
					[ 'foo', [], 'Invalid value is removed, final value is an empty array' ]
				]
			},
			{
				element: $like.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ true, true, 'Boolean value is preserved' ],
					[ '1', true, 'Numeric string is casted to boolean' ],
					[ '0', false, 'Numeric string that\'s falsey is casted to boolean' ],
					[ 'foo', true, 'String is casted to boolean' ],
					[ '', false, 'Empty string is casted to boolean' ],
					[ 999, true, 'Number is casted to boolean' ]
				]
			},
			{
				element: workprefArray.slice( 0 ),
				tests: [
					// in, out, msg
					[ 'any', 'any', 'Preserve value that is in options' ],
					[ 'foo', 'day', 'Invalid option normalizes to first option value' ],
					[ '', 'day', 'Empty string normalizes to first option value' ]
				]
			},
			{
				element: clothesArray.slice( 0 ),
				tests: [
					// in, out, msg
					[ 'cotton', [ 'cotton' ], 'Valid value is displayed within array' ],
					[ [ 'jeans', 'flanel' ], [ 'jeans', 'flanel' ], 'Valid array preserved' ],
					[ [ 'jeans', 'foo', 'flanel' ], [ 'jeans', 'flanel' ], 'Invalid values are removed from array' ],
					[ [ 'jeans', 'flanel', 'jeans' ], [ 'jeans', 'flanel' ], 'Duplicate entries are removed' ],
					[ 'foo', [], 'Invalid value is removed, final value is an empty array' ]
				]
			}
		];

		cases.forEach( function ( testCase ) {
			var element = new fr.Element( testCase.element );

			testCase.tests.forEach( function ( testArray ) {
				var testInput = testArray[ 0 ],
					testOutput = testArray[ 1 ],
					testMsg = testArray[ 2 ];

				assert.deepEqual(
					element.normalizeValue( testInput ),
					testOutput,
					'Type ' + element.getType() + ': ' + testMsg
				);
			} );
		} );
	} );

	QUnit.test( 'getValue (from DOM)', function ( assert ) {
		var $el, element, arr;

		$el = $name.clone().val( 'Testing' ); // Change the actual DOM element
		element = new fr.Element( $el[ 0 ] );
		assert.equal(
			element.getValue(),
			'Testing',
			'Initial DOM value (text with explicit value) is set as element value'
		);

		element = new fr.Element( $age.clone()[ 0 ] );
		assert.equal(
			element.getValue(),
			0,
			'Initial DOM value (number) is set as element value'
		);

		element = new fr.Element( $color.clone()[ 0 ] );
		assert.equal(
			element.getValue(),
			'green',
			'Initial DOM value (select with selected option) is set as element value'
		);

		$el = $transit.clone();
		$el[ 0 ].value = 'car'; // Set initial values
		element = new fr.Element( $el[ 0 ] );
		assert.deepEqual(
			element.getValue(),
			[ 'car' ],
			'Initial DOM value (select-multiple with two selected option) is set as element value, as array'
		);

		$el = $transit.clone();
		$el.val( [ 'bus', 'bike' ] ); // Set initial values
		element = new fr.Element( $el[ 0 ] );
		assert.deepEqual(
			element.getValue(),
			[ 'bus', 'bike' ],
			'Initial DOM value (select-multiple with two selected option) is set as element value, as array'
		);

		$el = $like.clone();
		element = new fr.Element( $el[ 0 ] );
		assert.equal(
			element.getValue(),
			true,
			'Initial DOM value (checkbox) is set as element value, as boolean'
		);

		arr = workprefArray.slice( 0 ); // Copy array
		element = new fr.Element( arr );
		assert.equal(
			element.getValue(),
			'day',
			'Initial DOM value (radio-group with none selected) is corrected to first option value'
		);

		element = new fr.Element( [
			$( $.parseHTML( '<input id="workpref-day" name="workpref" value="day" type="radio">' ) )[ 0 ],
			$( $.parseHTML( '<input id="workpref-night" name="workpref" value="night" type="radio" checked>' ) )[ 0 ],
			$( $.parseHTML( '<input id="workpref-any" name="workpref" value="any" type="radio">' ) )[ 0 ]
		] );
		assert.equal(
			element.getValue(),
			'night',
			'Initial DOM value (radio-group with one selected) is set as element value'
		);

		element = new fr.Element( clothesArray.slice( 0 ) );
		assert.deepEqual(
			element.getValue(),
			[],
			'Initial DOM value (checkbox-group with none selected) is set as element value, as array'
		);

		arr = clothesArray.slice( 0 ); // Copy array
		arr[ 1 ].checked = true; // Change value of second input (flanel)
		element = new fr.Element( arr );
		assert.deepEqual(
			element.getValue(),
			[ 'flanel' ],
			'Initial DOM value (checkbox-group with one selected) is set as element value, as array'
		);
	} );

	QUnit.test( 'setValue and getValue', function ( assert ) {
		var cases = [
			{
				element: $name.clone()[ 0 ],
				tests: [
					// setValue, getValue, msg
					[ 'foo', 'foo', 'String is set correctly' ],
					[ '', '', 'Empty string is set correctly' ],
					[ 123, '123', 'Number is cast into string' ],
					[ false, 'false', 'Boolean is cast to string' ]
				]
			},
			{
				element: $age.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 123, 123, 'Preserve valid number' ],
					[ 'foo', 0, 'Invalid (string) returns 0' ],
					[ '123', 123, 'Numeric string casted to number' ]
				]
			},
			{
				element: $color.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 'blue', 'blue', 'Preserve value that is in options' ],
					[ 'foo', 'yellow', 'Invalid option normalizes to first option value' ]
				]
			},
			{
				element: $transit.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ 'subway', [ 'subway' ], 'Valid value is displayed within array' ],
					[ [ 'subway', 'bus' ].sort(), [ 'subway', 'bus' ].sort(), 'Valid array preserved' ],
					[ [ 'subway', 'foo', 'bus' ].sort(), [ 'subway', 'bus' ].sort(), 'Invalid values are removed from array' ],
					[ [ 'subway', 'bus', 'subway' ].sort(), [ 'subway', 'bus' ].sort(), 'Duplicate values are removed from array' ],
					[ 'foo', [], 'Invalid value is removed, final value is an empty array' ]
				]
			},
			{
				element: $like.clone()[ 0 ],
				tests: [
					// in, out, msg
					[ true, true, 'Boolean value is preserved' ],
					[ '1', true, 'Numeric string is casted to boolean' ],
					[ '0', false, 'Numeric string that\'s falsey is casted to boolean' ],
					[ 'foo', true, 'String is casted to boolean' ],
					[ '', false, 'Empty string is casted to boolean' ],
					[ 999, true, 'Number is casted to boolean' ]
				]
			},
			{
				element: [
					$( $.parseHTML( '<input id="workpref-day" name="workpref" value="day" type="radio">' ) )[ 0 ],
					$( $.parseHTML( '<input id="workpref-night" name="workpref" value="night" type="radio">' ) )[ 0 ],
					$( $.parseHTML( '<input id="workpref-any" name="workpref" value="any" type="radio">' ) )[ 0 ]
				],
				tests: [
					// in, out, msg
					[ 'any', 'any', 'Preserve value that exists in options' ],
					[ 'foo', 'day', 'Invalid option normalizes to first option value' ],
					[ '', 'day', 'Empty string normalizes to first option value' ]
				]
			},
			{
				element: clothesArray.slice( 0 ),
				tests: [
					// in, out, msg
					[ 'cotton', [ 'cotton' ], 'Valid value is displayed within array' ],
					[ [ 'jeans', 'flanel' ], [ 'jeans', 'flanel' ], 'Valid array preserved' ],
					[ [ 'jeans', 'foo', 'flanel' ], [ 'jeans', 'flanel' ], 'Invalid values are removed from array' ],
					[ [ 'jeans', 'flanel', 'jeans' ], [ 'jeans', 'flanel' ], 'Duplicate entries are removed' ],
					[ 'foo', [], 'Invalid value is removed, final value is an empty array' ]
				]
			}
		];

		cases.forEach( function ( testCase ) {
			var element = new fr.Element( testCase.element );

			testCase.tests.forEach( function ( testArray ) {
				var newValue = testArray[ 0 ],
					expected = testArray[ 1 ],
					msg = testArray[ 2 ];

				element.setValue( newValue );
				assert.deepEqual(
					element.getValue(),
					expected,
					'Type ' + element.getType() + ': ' + msg
				);
			} );
		} );
	} );

	QUnit.test( 'compareValues', function ( assert ) {
		var cases = [
			// arr1, arr2, expected, msg
			[ 1, 1, true, 'Equal and same number values' ],
			[ '1', 1, false, 'Number and string are not equal' ],
			[ 'foo', 'foo   ', false, 'Strings with spaces are not equal to trimmed string' ],
			[ [ 1, 2, 3 ], [ 1, 2, 3 ], true, 'Equal and same arrays' ],
			[ [ 1, 2, 3 ], [ 1, 3, 2 ], true, 'Equal array values, different order; equal' ],
			[ [ 3, 2, 1 ], [ 1, 2, 3 ], true, 'Equal array values, reverse order; equal' ],
			[ [ 1, 2, 3, 4 ], [ 1, 2, 3 ], false, 'array2 is a subset of array1; unequal' ],
			[ [ 1, 2, 3 ], [ 1, 2, 3, 4 ], false, 'array1 is a subset of array2; unequal' ]
		];

		cases.forEach( function ( testCase ) {
			var element = new fr.Element( $name.clone()[ 0 ] ),
				arr1 = testCase[ 0 ],
				arr2 = testCase[ 1 ],
				expected = testCase[ 2 ],
				msg = testCase[ 3 ];

			assert.equal(
				element.compareValues( arr1, arr2 ),
				expected,
				msg
			);
		} );
	} );

	QUnit.test( 'getDetails', function ( assert ) {
		var cases = [
			{
				name: 'name',
				element: $name.clone()[ 0 ],
				expected: {
					type: 'text'
				}
			},
			{
				name: 'age',
				element: $age.clone()[ 0 ],
				expected: {
					type: 'number',
					range: {
						min: null,
						max: null
					}
				}
			},
			{
				name: 'ageWithBothLimits',
				element: $ageWithBothLimits.clone()[ 0 ],
				expected: {
					type: 'number',
					range: {
						min: 10,
						max: 120
					}
				}
			},
			{
				name: 'color',
				element: $color.clone()[ 0 ],
				expected: {
					type: 'select-one',
					options: [ 'yellow', 'green', 'blue', 'red' ],
					separator: ','
				}
			},
			{
				name: 'transit',
				element: $transit.clone()[ 0 ],
				expected: {
					type: 'select-multiple',
					options: [ 'car', 'bus', 'subway', 'bike' ],
					separator: ','
				}
			},
			{
				name: 'like',
				element: $like.clone()[ 0 ],
				expected: {
					type: 'checkbox'
				}
			},
			{
				name: 'workpref',
				element: workprefArray.slice( 0 ),
				expected: {
					type: 'radio-group',
					options: [ 'day', 'night', 'any' ],
					separator: ','
				}
			},
			{
				name: 'clothes',
				element: clothesArray.slice( 0 ),
				expected: {
					type: 'checkbox-group',
					options: [ 'jeans', 'flanel', 'cotton' ],
					separator: ','
				}
			}
		];

		cases.forEach( function ( testCase ) {
			var element = new fr.Element( testCase.element, testCase.name );

			assert.deepEqual(
				element.getDetails(),
				testCase.expected,
				'Correct details for type ' + element.getType()
			);
		} );
	} );

	QUnit.test( 'Update event', function ( assert ) {
		var cases = [
			{
				element: $name.clone()[ 0 ],
				values: [ 'foo', '', 'foobar', 'foobar' ],
				expected: [ 'foo', '', 'foobar' ] // No event if value is the same
			},
			{
				element: $age.clone()[ 0 ],
				values: [ 1, 0, 2, 'blah', 0, '12' ],
				// 'blah' will be invalid, so we set 0, then the next 0 is same
				// and will not register the event
				expected: [ 1, 0, 2, 0, 12 ] // Normalize event + no event if same value
			},
			{
				element: $color.clone()[ 0 ],
				values: [ 'yellow', 'blue', 'green', 'foo', 'green' ],
				// 'foo' will be invalid, so we set 'yellow'
				expected: [ 'yellow', 'blue', 'green', 'yellow', 'green' ] // Normalize event + no event if same value
			},
			{
				element: $transit.clone()[ 0 ],
				values: [ 'car', [ 'car', 'subway' ], 'foo', [ 'bike', 'subway' ], [ 'subway', 'bike' ] ],
				// 'foo' is invalid - becomes nothing (value isn't mandatory for 'multiselect')
				// 'bike','subway' is the same as 'subway','bike' and so will not register event
				expected: [ [ 'car' ], [ 'car', 'subway' ], [], [ 'bike', 'subway' ] ]
			},
			{
				element: [
					$( $.parseHTML( '<input id="workpref-day" name="workpref" value="day" type="radio">' ) )[ 0 ],
					$( $.parseHTML( '<input id="workpref-night" name="workpref" value="night" type="radio">' ) )[ 0 ],
					$( $.parseHTML( '<input id="workpref-any" name="workpref" value="any" type="radio">' ) )[ 0 ]
				],
				values: [ 'day', 'any', 'any', 'day', 'night', 'any', 'foo', 'any' ],
				// Initial value is 'day' so that change will not emit update event
				// Ignore same value, foo becomes 'day' (first option)
				expected: [ 'any', 'day', 'night', 'any', 'day', 'any' ]
			},
			{
				element: [
					$( $.parseHTML( '<input id="clothes-jeans" name="clothes" value="jeans" type="checkbox">' ) )[ 0 ],
					$( $.parseHTML( '<input id="clothes-flanel" name="clothes" value="flanel" type="checkbox">' ) )[ 0 ],
					$( $.parseHTML( '<input id="clothes-cotton" name="clothes" value="cotton" type="checkbox">' ) )[ 0 ]
				],
				values: [ 'flanel', [ 'jeans', 'foo' ], 'jeans', 'foo', [ 'cotton', 'flanel' ], [ 'flanel', 'cotton' ] ],
				// Everything is in an array;
				// 'foo' is invalid, it is taken out when with another value,
				// and transforms to nothing-value (options aren't mandatory) when alone
				// next value after ['jeans','foo'] is 'jeans' on its own, which is also the current value, no event
				// ['cotton','flanel'] is same as 'flanel','cotton' and will not emit event
				expected: [ [ 'flanel' ], [ 'jeans' ], [], [ 'cotton', 'flanel' ] ]
			}
		];

		cases.forEach( function ( testCase ) {
			var element = new fr.Element( testCase.element ),
				events = [],
				updateEvent = function ( value ) {
					events.push( value );
				};

			// Connect
			element.on( 'update', updateEvent );

			// Update values
			testCase.values.forEach( function ( newVal ) {
				element.setValue( newVal );
			} );

			assert.deepEqual(
				events,
				testCase.expected,
				'Event "update" registered for type "' + element.getType() + '"'
			);

			// Disconnect
			element.off( 'update', updateEvent );
		} );
	} );

	QUnit.test( 'Active event', function ( assert ) {
		var element = new fr.Element( $name.clone()[ 0 ] ),
			events = [],
			activeEvent = function ( isActive ) {
				events.push( isActive );
			};

		// Connect
		element.on( 'active', activeEvent );

		// Run operations
		element.toggle( true ); // true
		element.toggle( false ); // false
		element.toggle(); // true
		element.toggle(); // false
		element.toggle(); // true
		element.toggle( true ); // true; no event because it's not different

		// Test
		assert.deepEqual(
			events,
			[ true, false, true, false, true ],
			'Event "active" registered successfully'
		);

		// Disconnect
		element.off( 'active', activeEvent );
	} );
}() );
