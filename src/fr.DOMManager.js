( function () {
	/**
	 * DOM Manager class, manages the element models
	 *
	 * @class
	 * @mixin OO.EventEmitter
	 * @mixin OO.EmitterList
	 *
	 * @constructor
	 * @param {Object} [config] Configuration options
	 * @cfg {boolean} [active] Manager is active
	 */
	fr.DOMManager = function FrDOMManager( config ) {
		config = config || {};

		// Mixin constructor
		OO.EventEmitter.call( this );
		OO.EmitterList.call( this );

		this.active = false;
		this.initiallyActive = !!config.active;
		this.toggle( !!config.active );

		this.aggregate( {
			update: 'elementUpdate',
			active: 'elementActive'
		} );
		this.connect( this, {
			elementUpdate: 'onElementUpdate',
			elementActive: 'onElementActive'
		} );
	};

	/* Initialization */

	OO.initClass( fr.DOMManager );
	OO.mixinClass( fr.DOMManager, OO.EventEmitter );
	OO.mixinClass( fr.DOMManager, OO.EmitterList );

	/* Events */

	/**
	 * @event update
	 * @param {string} name Element name
	 * @param {string|number|boolean} value Element value
	 *
	 * An element's value has changed
	 */

	/**
	 * @event active
	 * @param {string} name Element name
	 * @param {boolean} isActive Element is active
	 *
	 * An element's active state was changed
	 */

	/* Methods */

	/**
	 * Respond to element update event
	 *
	 * @param {fr.Element} element Element
	 * @param {boolean} value Element's current value
	 * @fires update
	 */
	fr.DOMManager.prototype.onElementUpdate = function ( element, value ) {
		if ( element.isActive() ) {
			this.emit( 'update', element.getName(), value );
		}
	};

	/**
	 * Respond to element active event
	 *
	 * @param {fr.Element} element Element
	 * @param {boolean} isActive Element is active
	 * @fires active
	 */
	fr.DOMManager.prototype.onElementActive = function ( element, isActive ) {
		this.emit( 'active', element.getName(), isActive );
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

	/**
	 * Get active element details
	 *
	 * @return {Object} Object representing the element details
	 */
	fr.DOMManager.prototype.getDetails = function () {
		var result = {};

		this.getActiveItems().forEach( function ( element ) {
			result[ element.getName() ] = element.getDetails();
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

	/**
	 * Stop following an element, or all elements
	 *
	 * @param  {string} [name] Element name
	 */
	fr.DOMManager.prototype.stop = function ( name ) {
		this.toggle( false, name );
	};

	/**
	 * Start following an element, or all elements
	 *
	 * @param  {string} [name] Element name
	 */
	fr.DOMManager.prototype.start = function ( name ) {
		this.toggle( true, name );
	};

	/**
	 * Toggle following an element, or all elements
	 * @param {boolean} [isActive] Element (or all) are active
	 * @param {string} [name] Element name
	 */
	fr.DOMManager.prototype.toggle = function ( isActive, name ) {
		var el;

		if ( name ) {
			el = this.getElementByName( name );
			if ( el ) {
				el.toggle( !!isActive );
			}
		} else {
			// Toggle all
			this.getItems().forEach( function ( element ) {
				element.toggle( !!isActive );
			} );
		}

		this.active = this.getItems().length ?
			!!this.getActiveItems().length :
			!!this.initiallyActive;
	};

	fr.DOMManager.prototype.getAllNames = function () {
		return this.getItems().map( function ( element ) {
			return element.getName();
		} );
	};
	/**
	 * @inheritdoc
	 */
	fr.DOMManager.prototype.addItems = function ( items ) {
		// Parent call
		OO.EmitterList.prototype.addItems.call( this, items );

		if ( this.isActive() ) {
			// Activate on add if the manager is active
			items.forEach( function ( item ) {
				item.toggle( true );
			} );
		}
	};

	fr.DOMManager.prototype.isActive = function ( name ) {
		var el;

		if ( name ) {
			el = this.getElementByName( name );
			return el && el.isActive();
		} else {
			return this.active;
		}
	};

	/**
	 * Get an element model by its name
	 *
	 * @param {string} name Element name
	 * @return {fr.Element|null} Element or null if not found
	 */
	fr.DOMManager.prototype.getElementByName = function ( name ) {
		return this.getItems().filter( function ( element ) {
			return element.getName() === name;
		} )[ 0 ] || null;
	};

	/**
	 * Get all the active items
	 *
	 * @return {fr.Element[]} An array of active elements
	 */
	fr.DOMManager.prototype.getActiveItems = function () {
		return this.getItems().filter( function ( element ) {
			return element.isActive();
		} );
	};

	/**
	 * Destroy the instance, disconnect from events
	 */
	fr.DOMManager.prototype.destroy = function () {
		this.disconnect( this );

		this.getItems().forEach( function ( element ) {
			element.destroy();
		} );
	};
}() );
