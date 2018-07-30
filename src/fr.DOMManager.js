( function () {
	fr.DOMManager = function FrDOMManager() {
		// Mixin constructor
		OO.EventEmitter.call( this );
		OO.EmitterList.call( this );

		this.aggregate( { update: 'elementUpdate' } );
		this.connect( this, { elementUpdate: 'onElementUpdate' } );
	};

	/* Initialization */

	OO.initClass( fr.DOMManager );
	OO.mixinClass( fr.DOMManager, OO.EventEmitter );
	OO.mixinClass( fr.DOMManager, OO.EmitterList );

	/* Events */

	/**
	 * @event update
	 * @param {Object} Object representing the name and value of the updated value
	 *
	 * An element's value has changed
	 */

	/* Methods */

	fr.DOMManager.prototype.onElementUpdate = function ( element, value ) {
		var obj = {};

		obj[ element.getName() ] = value;
		this.emit( 'update', obj );
	};

	/**
	 * Get the current full state of the element values
	 *
	 * @return {Object} Full state
	 */
	fr.DOMManager.prototype.getState = function () {
		var result = {};

		this.getActiveItems().forEach( function ( element ) {
			result[ element.getName() ] = element.getValue();
		} );

		return result;
	};

	fr.DOMManager.prototype.setValues = function ( valuesObj ) {
		var manager = this;

		Object.keys( valuesObj ).forEach( function ( name ) {
			var el = manager.getElementByName( name );
			if ( el ) {
				el.setValue( valuesObj[ name ] );
			}
		} );
	};

	/**
	 * Get the value of a single element by its name
	 *
	 * @param {string} name Element name
	 * @return {string|boolean|number} Element current value
	 */
	fr.DOMManager.prototype.getValue = function ( name ) {
		var el = this.getElementByName( name );

		if ( el ) {
			return el.getValue();
		}

		return null;
	};

	fr.DOMManager.prototype.stop = function ( name ) {
		this.toggle( false, name );
	};

	fr.DOMManager.prototype.start = function ( name ) {
		this.toggle( true, name );
	};

	fr.DOMManager.prototype.toggle = function ( isActive, name ) {
		var el;

		if ( name ) {
			el = this.getElementByName( name );
			if ( el ) {
				el.toggle( !!isActive );
			}
		} else {
			// Stop all
			this.getItems().forEach( function ( element ) {
				element.toggle( !!isActive );
			} );
		}
	};

	fr.DOMManager.prototype.getElementByName = function ( name ) {
		return this.getItems().filter( function ( element ) {
			return element.getName() === name;
		} )[ 0 ];
	};

	fr.DOMManager.prototype.getActiveItems = function () {
		return this.getItems().filter( function ( element ) {
			return element.isActive();
		} );
	};
}() );
