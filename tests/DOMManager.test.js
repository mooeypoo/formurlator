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
				$.parseHTML( '<input id="workpref-day" name="workpref" value="day" type="radio">' )[ 0 ],
				$.parseHTML( '<input id="workpref-night" name="workpref" value="night" type="radio">' )[ 0 ],
				$.parseHTML( '<input id="workpref-any" name="workpref" value="any" type="radio">' )[ 0 ]
			],
			clothes: [
				$.parseHTML( '<input id="clothes-jeans" name="clothes" value="jeans" type="checkbox">' )[ 0 ],
				$.parseHTML( '<input id="clothes-flanel" name="clothes" value="flanel" type="checkbox">' )[ 0 ],
				$.parseHTML( '<input id="clothes-cotton" name="clothes" value="cotton" type="checkbox">' )[ 0 ]
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
		};

	QUnit.module( 'fr.DOMManager' );

	QUnit.test( 'getState', function ( assert ) {
		var cases = [
			{
				values: {},
				expectedState: $.extend( true, {}, initialState ),
				msg: 'Initial state'
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
				var dom = Array.isArray( itemsDefinition[ name ] ) ?
					itemsDefinition[ name ] :
					$.parseHTML( itemsDefinition[ name ] )[ 0 ];

				items.push(
					new fr.Element( dom, name )
				);
			} );
			manager.addItems( items );

			// Change values
			manager.setValues( testCase.values );

			assert.deepEqual(
				manager.getState(),
				testCase.expectedState,
				testCase.msg
			);
		} );
	} );

	QUnit.test( 'start / stop', function ( assert ) {
		var newState,
			manager = new fr.DOMManager(),
			items = [];

		// Add all items
		Object.keys( itemsDefinition ).forEach( function ( name ) {
			var dom = Array.isArray( itemsDefinition[ name ] ) ?
				itemsDefinition[ name ] :
				$.parseHTML( itemsDefinition[ name ] )[ 0 ];

			items.push(
				new fr.Element( dom, name )
			);
		} );
		manager.addItems( items );

		assert.deepEqual(
			manager.getState(),
			initialState,
			'Initially, all items are represented in state'
		);

		// Stop one item
		manager.stop( 'name' );
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
	} );

	QUnit.test( 'Events', function ( assert ) {
		var events = [],
			manager = new fr.DOMManager(),
			items = [];

		// Add all items
		Object.keys( itemsDefinition ).forEach( function ( name ) {
			var dom = Array.isArray( itemsDefinition[ name ] ) ?
				itemsDefinition[ name ] :
				$.parseHTML( itemsDefinition[ name ] )[ 0 ];

			items.push(
				new fr.Element( dom, name )
			);
		} );
		manager.addItems( items );

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

}() );
