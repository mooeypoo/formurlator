( function () {
	var itemsDefinition = {
			name: '<input id="firstName" type="text" placeholder="First name">',
			age: '<input id="age" type="number">',
			ageWithBothLimits: '<input id="age" type="number" min="10" max="120">',
			ageWithMinLimit: '<input id="age" type="number" min="10">',
			ageWithMaxLimit: '<input id="age" type="number" max="120">',
			color: '<select id="color">' +
					'<option value="yellow">Yellow</option>' +
					'<option value="green" selected>Green</option>' +
					'<option value="blue">Blue</option>' +
					'<option value="red">Red</option>' +
				'</select>',
			transit: '<select id="transit" multiple>' +
					'<option value="car">Car</option>' +
					'<option value="bus" selected>Bus</option>' +
					'<option value="subway">Subway</option>' +
					'<option value="bike">Bike</option>' +
				'</select>',
			like: '<input id="like" type="checkbox" checked>',
			workpref: [
				'<input id="workpref-day" name="workpref" value="day" type="radio">',
				'<input id="workpref-night" name="workpref" value="night" type="radio">',
				'<input id="workpref-any" name="workpref" value="any" type="radio">'
			],
			clothes: [
				'<input id="clothes-jeans" name="clothes" value="jeans" type="checkbox">',
				'<input id="clothes-flanel" name="clothes" value="flanel" type="checkbox">',
				'<input id="clothes-cotton" name="clothes" value="cotton" type="checkbox">'
			]
		},
		initialState = {
			name: '',
			age: 0,
			ageWithBothLimits: 10, // Minimum
			ageWithMinLimit: 10, // Minimum
			ageWithMaxLimit: 0,
			color: 'green', // Selected option
			transit: [ 'bus' ], // Initially selected
			like: true, // Initial checked
			workpref: 'day', // None selected; select the first option
			clothes: [] // None selected
		},
		getDOMfromItemDefinition = function ( name ) {
			var result;
			if ( Array.isArray( itemsDefinition[ name ] ) ) {
				result = [];
				itemsDefinition[ name ].forEach( function ( el ) {
					var element = $.parseHTML( el )[ 0 ];
					result.push( element.cloneNode( true ) );
				} );
				return result;
			} else {
				result = $.parseHTML( itemsDefinition[ name ] )[ 0 ];
				return result.cloneNode( true );
			}
		};

	QUnit.module( 'fr.DOMManager' );

	QUnit.test( 'setValues & getState', function ( assert ) {
		var cases = [
			{
				values: {},
				expectedState: $.extend( true, {}, {}, initialState ),
				msg: 'Initial state'
			},
			{
				values: { invalid: 'blah' },
				expectedState: $.extend( true, {}, {}, initialState ),
				msg: 'Invalid value is ignored'
			},
			{
				values: { invalid: 'blah', name: 'bar' },
				expectedState: $.extend( true, {}, {}, initialState, {
					name: 'bar'
				} ),
				msg: 'Invalid value is ignored, valid values in the same operation are counted'
			},
			{
				values: { age: '20', name: 'foo' },
				expectedState: $.extend( true, {}, initialState, {
					name: 'foo',
					age: 20
				} ),
				msg: 'Changing valid values for numbers and strings'
			},
			{
				values: { like: 1, age: '25' },
				expectedState: $.extend( true, {}, initialState, {
					like: true,
					age: 25
				} ),
				msg: 'Changing valid values and casting them to the correct type'
			}
		];

		cases.forEach( function ( testCase ) {
			var manager = new fr.DOMManager(),
				items = [];

			// Add items
			Object.keys( itemsDefinition ).forEach( function ( name ) {
				var dom = getDOMfromItemDefinition( name );

				items.push(
					new fr.Element( dom, name )
				);
			} );
			manager.addItems( items );
			manager.start(); // Start all; we're testing the state response

			// Change values
			manager.setValues( testCase.values );

			assert.deepEqual(
				manager.getState(),
				testCase.expectedState,
				testCase.msg
			);
		} );
	} );

	QUnit.test( 'setValues & getValue', function ( assert ) {
		var cases = [
			{
				values: {},
				expectedValue: {
					age: 0,
					name: ''
				},
				msg: 'Initial state, values are initial values'
			},
			{
				values: { invalid: 'blah', name: 'bar' },
				expectedValue: {
					invalid: null,
					name: 'bar'
				},
				msg: 'Invalid value is returns null, valid values in the same operation are counted'
			},
			{
				values: { age: '20', name: 'foo' },
				expectedValue: {
					name: 'foo',
					age: 20
				},
				msg: 'Changing valid values for numbers and strings'
			},
			{
				values: { like: 1, age: '25' },
				expectedValue: {
					like: true,
					age: 25
				},
				msg: 'Changing valid values and casting them to the correct type'
			}
		];
		cases.forEach( function ( testCase ) {
			var manager = new fr.DOMManager(),
				items = [];

			// Add items
			Object.keys( itemsDefinition ).forEach( function ( name ) {
				var dom = getDOMfromItemDefinition( name );

				items.push(
					new fr.Element( dom, name )
				);
			} );
			manager.addItems( items );
			manager.start(); // Start all; we're testing the state response

			// Change values
			manager.setValues( testCase.values );

			Object.keys( testCase.expectedValue ).forEach( function ( name ) {
				assert.deepEqual(
					manager.getValue( name ),
					testCase.expectedValue[ name ],
					testCase.msg + ' -> ' + name
				);

			} );

		} );
	} );

	QUnit.test( 'start / stop / isActive', function ( assert ) {
		var newState,
			manager = new fr.DOMManager(),
			items = [];

		// Add all items
		Object.keys( itemsDefinition ).forEach( function ( name ) {
			var dom = getDOMfromItemDefinition( name ),
				item = new fr.Element( dom, name );

			items.push( item );
		} );
		manager.addItems( items );

		assert.deepEqual(
			manager.getState(),
			{},
			'Initially, all items are off'
		);

		manager.start();
		assert.deepEqual(
			manager.getState(),
			initialState,
			'When manager.start() is sent, all items are active in the state'
		);

		// Stop one item
		manager.stop( 'name' );
		assert.equal(
			manager.isActive( 'name' ),
			false,
			'A specific item that stopped is no longer active'
		);
		newState = $.extend( true, {}, initialState );
		delete newState.name;
		assert.deepEqual(
			manager.getState(),
			newState,
			'The state represents only active items'
		);

		manager.setValues( { name: 'foo', age: 15 } );
		assert.deepEqual(
			manager.getState(),
			$.extend( true, {}, newState, { age: 15 } ),
			'Other items\' values change, inactive elements aren\'t represented'
		);

		manager.start( 'name' );
		assert.deepEqual(
			manager.getState(),
			$.extend( true, {}, initialState, { name: 'foo', age: 15 } ),
			'When item is restarted, its true value is represented in the state'
		);

		manager.stop( 'nonexistent' );
		assert.deepEqual(
			manager.getState(),
			$.extend( true, {}, initialState, { name: 'foo', age: 15 } ),
			'Ivalid name is ignored for stopping'
		);
	} );

	QUnit.test( 'getDetails', function ( assert ) {
		var manager = new fr.DOMManager(),
			items = [];

		// Add all items
		Object.keys( itemsDefinition ).forEach( function ( name ) {
			var dom = getDOMfromItemDefinition( name );

			items.push(
				new fr.Element( dom, name )
			);
		} );
		manager.addItems( items );
		manager.start();

		assert.deepEqual(
			manager.getDetails(),
			{
				name: { type: 'text' },
				age: {
					type: 'number',
					range: {
						min: null,
						max: null
					}
				},
				ageWithBothLimits: {
					type: 'number',
					range: {
						min: 10,
						max: 120
					}
				},
				ageWithMaxLimit: {
					type: 'number',
					range: {
						min: null,
						max: 120
					}
				},
				ageWithMinLimit: {
					type: 'number',
					range: {
						min: 10,
						max: null
					}
				},
				color: {
					type: 'select-one',
					options: [ 'yellow', 'green', 'blue', 'red' ],
					separator: ','
				},
				transit: {
					type: 'select-multiple',
					options: [ 'car', 'bus', 'subway', 'bike' ],
					separator: ','
				},
				like: {
					type: 'checkbox'
				},
				workpref: {
					type: 'radio-group',
					options: [ 'day', 'night', 'any' ],
					separator: ','
				},
				clothes: {
					type: 'checkbox-group',
					options: [ 'jeans', 'flanel', 'cotton' ],
					separator: ','
				}
			},
			'Element details outputted successfully'
		);
	} );

	QUnit.test( 'Events', function ( assert ) {
		var events = [],
			manager = new fr.DOMManager(),
			items = [];

		// Add all items
		Object.keys( itemsDefinition ).forEach( function ( name ) {
			var dom = getDOMfromItemDefinition( name );

			items.push(
				new fr.Element( dom, name )
			);
		} );
		manager.addItems( items );
		manager.start();
		// Connect events
		manager.on( 'update', function ( name, value ) {
			events.push( [ 'update', name, value ] );
		} );
		manager.on( 'active', function ( name, value ) {
			events.push( [ 'active', name, value ] );
		} );

		// Run actions
		manager.setValues( { age: 15, transit: [ 'bus', 'subway' ] } );
		manager.setValues( { age: 15, transit: [ 'car' ] } );
		manager.setValues( { age: 42, color: 'red' } );
		manager.stop( 'color' );
		manager.setValues( { like: false, color: 'blue' } );
		manager.setValues( { workpref: 'any', color: 'yellow' } );
		manager.start( 'color' );
		manager.setValues( { like: true, color: 'blue' } );

		assert.deepEqual(
			events,
			[
				[ 'update', 'age', 15 ],
				[ 'update', 'transit', [ 'bus', 'subway' ] ],
				[ 'update', 'transit', [ 'car' ] ], // Only transit was updated; age was same value
				[ 'update', 'age', 42 ],
				[ 'update', 'color', 'red' ],
				[ 'active', 'color', false ],
				[ 'update', 'like', false ], // Color change isn't emitting event
				[ 'update', 'workpref', 'any' ], // Color change isn't emitting event
				[ 'active', 'color', true ],
				[ 'update', 'like', true ],
				[ 'update', 'color', 'blue' ] // Color is active again; update emitted
			],
			'Events emitted properly'
		);
	} );

	QUnit.test( 'Destroy', function ( assert ) {
		var events = [],
			manager = new fr.DOMManager(),
			items = [];

		// Add all items
		Object.keys( itemsDefinition ).forEach( function ( name ) {
			var dom = getDOMfromItemDefinition( name );

			items.push(
				new fr.Element( dom, name )
			);
		} );
		manager.addItems( items );
		manager.start();
		// Connect events
		manager.on( 'update', function ( name, value ) {
			events.push( [ 'update', name, value ] );
		} );
		manager.on( 'active', function ( name, value ) {
			events.push( [ 'active', name, value ] );
		} );

		// Run actions (same as events test)
		manager.setValues( { age: 15, transit: [ 'bus', 'subway' ] } );
		manager.setValues( { age: 15, transit: [ 'car' ] } );
		manager.setValues( { age: 42, color: 'red' } );
		manager.destroy();
		manager.setValues( { like: false, color: 'blue' } );
		manager.setValues( { workpref: 'any', color: 'yellow' } );
		manager.setValues( { like: true, color: 'blue' } );

		assert.deepEqual(
			events,
			[
				[ 'update', 'age', 15 ],
				[ 'update', 'transit', [ 'bus', 'subway' ] ],
				[ 'update', 'transit', [ 'car' ] ], // Only transit was updated; age was same value
				[ 'update', 'age', 42 ],
				[ 'update', 'color', 'red' ]
			],
			'Events were only emitted before the manager was destroyed'
		);
	} );

}() );
