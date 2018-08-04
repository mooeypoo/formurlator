( function () {
	var getDOMElement = function ( elString ) {
			var result;
			if ( Array.isArray( elString ) ) {
				result = [];
				elString.forEach( function ( el ) {
					var element = $.parseHTML( el )[ 0 ];
					result.push( element.cloneNode( true ) );
				} );
				return result;
			} else {
				result = $.parseHTML( elString )[ 0 ];
				return result.cloneNode( true );
			}
		},
		itemsDefinition = {
			name: getDOMElement( '<input id="firstName" type="text" placeholder="First name">' ),
			age: getDOMElement( '<input id="age" type="number">' ),
			ageWithBothLimits: getDOMElement( '<input id="age" type="number" min="10" max="120">' ),
			ageWithMinLimit: getDOMElement( '<input id="age" type="number" min="10">' ),
			ageWithMaxLimit: getDOMElement( '<input id="age" type="number" max="120">' ),
			color: getDOMElement( '<select id="color">' +
					'<option value="yellow">Yellow</option>' +
					'<option value="green" selected>Green</option>' +
					'<option value="blue">Blue</option>' +
					'<option value="red">Red</option>' +
				'</select>' ),
			transit: getDOMElement( '<select id="transit" multiple>' +
					'<option value="car">Car</option>' +
					'<option value="bus" selected>Bus</option>' +
					'<option value="subway">Subway</option>' +
					'<option value="bike">Bike</option>' +
				'</select>' ),
			like: getDOMElement( '<input id="like" type="checkbox" checked>' ),
			workpref: [
				getDOMElement( '<input id="workpref-day" name="workpref" value="day" type="radio">' ),
				getDOMElement( '<input id="workpref-night" name="workpref" value="night" type="radio">' ),
				getDOMElement( '<input id="workpref-any" name="workpref" value="any" type="radio">' )
			],
			clothes: [
				getDOMElement( '<input id="clothes-jeans" name="clothes" value="jeans" type="checkbox">' ),
				getDOMElement( '<input id="clothes-flanel" name="clothes" value="flanel" type="checkbox">' ),
				getDOMElement( '<input id="clothes-cotton" name="clothes" value="cotton" type="checkbox">' )
			]
		},
		initialQuery = {
			name: '',
			age: '0',
			ageWithBothLimits: '10', // Minimum
			ageWithMinLimit: '10', // Minimum
			ageWithMaxLimit: '0',
			color: 'green', // Selected option
			transit: 'bus', // Initially selected
			like: '1', // Initial checked
			workpref: 'day', // None selected; select the first option
			clothes: '' // None selected
		};

	fr.TESTING = true;
	QUnit.module( 'fr.Controller' );

	QUnit.test( 'add', function ( assert ) {
		var controller = new fr.Controller();

		controller.add( { foo: getDOMElement( '<input type="checkbox" checked>' ) } );
		controller.add( { foo: getDOMElement( '<input type="text" value="ignored">' ) } );
		assert.equal(
			controller.manager.getValue( 'foo' ),
			true,
			'Adding a valid input with value'
		);

		assert.throws(
			function () {
				controller.add( [ 'something', 'else' ] );
			},
			'Using invalid value (array) for add() throws an exception'
		);
		assert.throws(
			function () {
				controller.add( 'something else' );
			},
			'Using invalid value (string) for add() throws an exception'
		);

		controller = new fr.Controller();
		controller.add( { foo: getDOMElement( '<input type="checkbox" checked>' ) } );
		controller.add( { foo: getDOMElement( '<input type="text" value="ignored">' ) } );
		assert.equal(
			controller.manager.getValue( 'foo' ),
			true, // This is the value of a checkbox, not a text type
			'Adding an input with an existing name ignores the addition.'
		);
	} );

	QUnit.test( 'start / stop', function ( assert ) {
		var controller,
			definition = {
				name: getDOMElement( '<input id="firstName" type="text" placeholder="First name">' ),
				age: getDOMElement( '<input id="age" type="number">' ),
				ageWithBothLimits: getDOMElement( '<input id="age" type="number" min="10" max="120">' ),
				ageWithMinLimit: getDOMElement( '<input id="age" type="number" min="10">' ),
				ageWithMaxLimit: getDOMElement( '<input id="age" type="number" max="120">' ),
				color: getDOMElement( '<select id="color">' +
						'<option value="yellow">Yellow</option>' +
						'<option value="green" selected>Green</option>' +
						'<option value="blue">Blue</option>' +
						'<option value="red">Red</option>' +
					'</select>' ),
				transit: getDOMElement( '<select id="transit" multiple>' +
						'<option value="car">Car</option>' +
						'<option value="bus" selected>Bus</option>' +
						'<option value="subway">Subway</option>' +
						'<option value="bike">Bike</option>' +
					'</select>' ),
				like: getDOMElement( '<input id="like" type="checkbox" checked>' ),
				workpref: [
					getDOMElement( '<input id="workpref-day" name="workpref" value="day" type="radio">' ),
					getDOMElement( '<input id="workpref-night" name="workpref" value="night" type="radio">' ),
					getDOMElement( '<input id="workpref-any" name="workpref" value="any" type="radio">' )
				],
				clothes: [
					getDOMElement( '<input id="clothes-jeans" name="clothes" value="jeans" type="checkbox">' ),
					getDOMElement( '<input id="clothes-flanel" name="clothes" value="flanel" type="checkbox">' ),
					getDOMElement( '<input id="clothes-cotton" name="clothes" value="cotton" type="checkbox">' )
				]
			};

		controller = new fr.Controller();
		controller.add( definition );
		assert.deepEqual(
			controller.getURLQueryFromElements(),
			initialQuery,
			'Initially, all elements are on'
		);

		controller = new fr.Controller( { active: false } );
		controller.add( definition );
		assert.deepEqual(
			controller.getURLQueryFromElements(),
			{},
			'If controller starts with { active: false }, all elements are initially off when added'
		);

		controller = new fr.Controller();
		controller.add( definition );
		controller.stop();
		assert.deepEqual(
			controller.getURLQueryFromElements(),
			{},
			'.stop() stops all'
		);

		controller.start( 'name' );
		assert.deepEqual(
			controller.getURLQueryFromElements(),
			{ name: '' },
			'.start activates the specific element if it has a parameter'
		);

		controller.start();
		assert.deepEqual(
			controller.getURLQueryFromElements(),
			initialQuery,
			'.start without a parameter activates all parameters'
		);
	} );

	QUnit.test( 'convertElementValueToURLParam', function ( assert ) {
		var controller = new fr.Controller(),
			cases = [
				{
					input: 'foo',
					type: 'select-one',
					expected: 'foo'
				},
				{
					input: 10,
					type: 'number',
					expected: '10'
				},
				{
					input: [ 'foo', 'bar' ],
					type: 'checkbox-group',
					expected: 'foo,bar'
				},
				{
					input: [ 'foo', 'bar' ],
					type: 'select-multiple',
					expected: 'foo,bar'
				}
			];

		cases.forEach( function ( testCase ) {
			assert.deepEqual(
				controller.convertElementValueToURLParam(
					testCase.input,
					{ type: testCase.type }
				),
				testCase.expected,
				'Conversion: ' + testCase.type
			);
		} );
	} );

	QUnit.test( 'getURLQueryFromElements', function ( assert ) {
		var controller = new fr.Controller();

		controller.add( itemsDefinition );
		controller.start();

		assert.deepEqual(
			controller.getURLQueryFromElements(),
			initialQuery,
			'Query from initial values'
		);

		itemsDefinition.name.value = 'foo';
		itemsDefinition.clothes[ 0 ].checked = true; // jeans
		itemsDefinition.clothes[ 1 ].checked = true; // flanel

		assert.deepEqual(
			controller.getURLQueryFromElements(),
			$.extend( true, {}, initialQuery, {
				name: 'foo',
				clothes: 'jeans,flanel'
			} ),
			'Query changes and allows for multivalue'
		);
	} );

	QUnit.test( 'parseQueryString & getQueryToString', function ( assert ) {
		var controller = new fr.Controller(),
			cases = [
				{
					input: '',
					expected: {},
					msg: 'Empty string = empty object'
				},
				{
					input: 'foo=bar',
					expected: { foo: 'bar' },
					msg: 'One parameter pair.'
				},
				{
					input: 'foo=bar&baz=quuz',
					expected: { foo: 'bar', baz: 'quuz' },
					msg: 'Several pairs'
				},
				{
					input: 'foo=&baz=quuz',
					expected: { foo: '', baz: 'quuz' },
					msg: 'Parameter without a value'
				},
				{
					skipReverse: true, // This will be normalized as foo=
					input: 'foo&baz=quuz',
					expected: { foo: '', baz: 'quuz' },
					msg: 'Standalone parameter without equal file'
				},
				{
					skipReverse: true, // This should be normalized removing the ?
					input: '?foo=bar',
					expected: { foo: 'bar' },
					msg: 'Remove ? if needed'
				}
			];

		cases.forEach( function ( testCase ) {
			assert.deepEqual(
				controller.parseQueryString( testCase.input ),
				testCase.expected,
				testCase.msg
			);

			// Reverse the tests for getQueryToString
			if ( !testCase.skipReverse ) {
				assert.deepEqual(
					controller.getQueryToString( testCase.expected ),
					testCase.input,
					'Reverse case: ' + testCase.msg + ' (getQueryToString)'
				);
			}
		} );
	} );

	QUnit.test( 'getNewURLQuery', function ( assert ) {
		var cases = [
			{
				definition: {},
				initialQueryString: '',
				expected: {},
				msg: 'Empty model, empty query string = empty query'
			},
			{
				definition: {
					name: getDOMElement( '<input id="firstName" type="text" placeholder="First name">' ),
					age: getDOMElement( '<input id="age" type="number">' ),
					color: getDOMElement( '<select id="color">' +
							'<option value="yellow">Yellow</option>' +
							'<option value="green" selected>Green</option>' +
							'<option value="blue">Blue</option>' +
							'<option value="red">Red</option>' +
						'</select>' )
				},
				initialQueryString: '',
				expected: {
					name: '',
					age: '0',
					color: 'green'
				},
				msg: 'Full model, empty query string = full state in query'
			},
			{
				definition: {
					name: getDOMElement( '<input id="firstName" type="text" placeholder="First name">' ),
					age: getDOMElement( '<input id="age" type="number">' ),
					color: getDOMElement( '<select id="color">' +
							'<option value="yellow">Yellow</option>' +
							'<option value="green" selected>Green</option>' +
							'<option value="blue">Blue</option>' +
							'<option value="red">Red</option>' +
						'</select>' )
				},
				initialQueryString: 'foo=bar',
				expected: {
					name: '',
					age: '0',
					color: 'green',
					foo: 'bar'
				},
				msg: 'Full model, existing query string with unrecognized params = full state in query + unrecognized params'
			},
			{
				definition: {
					name: getDOMElement( '<input id="firstName" type="text" placeholder="First name">' ),
					age: getDOMElement( '<input id="age" type="number">' ),
					color: getDOMElement( '<select id="color">' +
							'<option value="yellow">Yellow</option>' +
							'<option value="green" selected>Green</option>' +
							'<option value="blue">Blue</option>' +
							'<option value="red">Red</option>' +
						'</select>' )
				},
				stop: [ 'name', 'color' ],
				newValues: {
					// Change all
					name: 'foo',
					age: 15,
					color: 'red'
				},
				initialQueryString: 'color=red&name=blah&foo=bar',
				expected: {
					// Name gets value from URL not model
					name: 'blah',
					age: '15',
					// Color gets value from URL not model
					color: 'red',
					foo: 'bar'
				},
				msg: 'Full model; stopping values retain them in URL with their old (nonchanging) values'
			}
		];

		cases.forEach( function ( testCase ) {
			var controller = new fr.Controller( { active: true } );

			controller.add( testCase.definition );

			if ( testCase.stop ) {
				testCase.stop.forEach( function ( name ) {
					controller.stop( name );
				} );
			}

			if ( testCase.newValues ) {
				controller.manager.setValues( testCase.newValues );
			}

			assert.deepEqual(
				controller.getNewURLQuery( testCase.initialQueryString ),
				testCase.expected,
				testCase.msg
			);
		} );
	} );
}() );
