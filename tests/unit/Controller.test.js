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

	QUnit.module( 'fr.Controller' );

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
}() );
