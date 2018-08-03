( function () {
	fr.Controller = function FrController() {
		// Initialize the DOMManager
		this.manager = new fr.DOMManager();
	};

	/* Initialization */
	OO.initClass( fr.Controller );

	/**
	 * Get URL Query from the current element models.
	 *
	 * @return {Object} New URL query
	 */
	fr.Controller.prototype.getURLQueryFromElements = function () {
		var controller = this,
			query = {},
			state = this.manager.getState(),
			details = this.manager.getDetails();

		Object.keys( state ).forEach( function ( name ) {
			query[ name ] = controller.convertElementValueToURLParam(
				state[ name ],
				details[ name ]
			);
		} );

		return query;
	};

	/**
	 * Convert a value from the element model into
	 * a value that can be in the URL query.
	 *
	 * @param  {string[]|string|number|boolean} value Element value
	 * @param  {Object} details Element details
	 * @return {string} Value for URL query
	 */
	fr.Controller.prototype.convertElementValueToURLParam = function ( value, details ) {
		switch ( details.type ) {
			case 'checkbox':
				return String( Number( value ) );
			case 'checkbox-group':
			case 'select-multiple':
				return value.join( details.separator );
			// case 'select-one':
			// case 'radio-group':
			default:
				return String( value );
		}
	};

	// fr.Controller.prototype.updateURL = function () {
	//
	// };

	// fr.Controller.prototype.readDataFromURLQuery = function () {
	//
	// };
	/**
	 * Add form elements with the names that will be used
	 * for the URL parameters representing their values and
	 * states.
	 *
	 * @param {[type]} objDefinition Object defining the
	 *  dom fields with the keys representing the URL parameter
	 *  names.
	 */
	fr.Controller.prototype.add = function ( objDefinition ) {
		var controller = this;

		objDefinition = objDefinition || {};

		Object.keys( objDefinition ).forEach( function ( name ) {
			var definition = objDefinition[ name ],
				element = definition;

			if ( Array.isArray( definition ) ) {
				// Sanity check, filter so there are only actual elements
				element = definition.filter( function ( el ) {
					return el instanceof Element;
				} );
			}

			// Add to the manager
			controller.manager.addItems( [
				new fr.Element( element, name )
			] );
		} );
	};

	fr.Controller.prototype.start = function ( name ) {
		this.manager.start( name );
	};
	fr.Controller.prototype.stop = function ( name ) {
		this.manager.stop( name );
	};
}() );
