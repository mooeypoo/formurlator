( function () {
	/**
	 * Controller for the formurlator system; controls the
	 * operation between the element manager and the URL query
	 * @class
	 *
	 * @constructor
	 * @param {Object} [config] Configuration options
	 * @cfg {boolean} [active=true] Elements start active when added.
	 *  If set to false, elements that are added will not be active
	 *  and won't be represented in the URL until they are purposefully
	 *  set to .start()
	 */
	fr.Controller = function FrController( config ) {
		config = config || {};

		// Initialize the DOMManager
		this.manager = new fr.DOMManager( {
			active: config.active !== undefined ? config.active : true
		} );

		// Events
		this.manager.connect( this, {
			update: 'onManagerChange',
			active: 'onManagerChange'
		} );
	};

	/* Initialization */
	OO.initClass( fr.Controller );

	/**
	 * Respond to change in the manager, either an updated element
	 * or a change in the active state of an element
	 */
	fr.Controller.prototype.onManagerChange = function () {
		var newQuery = this.getNewURLQuery();

		// Update the URL
		this.updateURL( newQuery );
	};

	/**
	 * Directly set and update a DOM value
	 *
	 * @param  {string} name Element name
	 * @param  {string|number|boolean} value Element value
	 */
	fr.Controller.prototype.setValue = function ( name, value ) {
		var obj = {};

		obj[ name ] = value;
		this.manager.setValues( obj );
	};

	/**
	 * Update the URL based on given query object
	 *
	 * @param {Object} fullQuery Full query parameters
	 */
	fr.Controller.prototype.updateURL = function ( fullQuery ) {
		/* istanbul ignore if  */
		if ( !fr.TESTING ) {
			// TODO: Fix this;
			// Using replaceState here as a stopgap for
			// https://github.com/mooeypoo/formurlator/issues/3
			window.history.replaceState(
				window.document.title,
				{ formurlator: 'formurlator' },
				'?' + this.getQueryToString( fullQuery )
			);
		}
	};

	fr.Controller.prototype.getQueryToString = function ( queryObject ) {
		var results = [];

		Object.keys( queryObject ).forEach( function ( param ) {
			results.push(
				[
					encodeURIComponent( param ),
					encodeURIComponent( queryObject[ param ] )
				].join( '=' )
			);
		} );

		return results.join( '&' );
	};

	/**
	 * Get the new query parameters representing the model state
	 * and the current URL state, considering inactive elements
	 * and unrecognized parameters.
	 *
	 * @param {string} [queryString] Query string
	 * @return {Object} New parameter query object
	 */
	fr.Controller.prototype.getNewURLQuery = function ( queryString ) {
		var extend = function ( obj, src ) {
				Object.keys( src ).forEach( function ( key ) {
					obj[ key ] = src[ key ];
				} );
				return obj;
			},
			stateParams = this.getURLQueryFromElements(),
			urlParams = this.parseQueryString( queryString );

		// Combine both objects, have stateParams override urlParams
		// This also makes sure that existing url params for inactive
		// elements are not updated, but also aren't removed
		return extend( urlParams, stateParams );
	};

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

	/**
	 * Parse query string into an object representing url parameters
	 * with their values
	 *
	 * @param {string} queryString Query string
	 * @return {Object} Object representing query parameters and their
	 *  values
	 */
	fr.Controller.prototype.parseQueryString = function ( queryString ) {
		var queries,
			params = {};

		queryString = queryString !== undefined ?
			queryString : window.location.search;

		queryString = decodeURIComponent( queryString );

		// Remove the ? if it exists
		if ( queryString.indexOf( '?' ) === 0 ) {
			queryString = queryString.substring( 1 );
		}

		// Split into key/value pairs
		queries = queryString.split( '&' );

		// Convert the array of strings into an object
		queries.forEach( function ( pair ) {
			var pieces = pair.split( '=' );

			if ( pieces[ 0 ] ) {
				params[ pieces[ 0 ] ] = pieces[ 1 ] || '';
			}
		} );

		return params;
	};

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
		var currentItems, urlParams, value,
			controller = this;

		if ( Array.isArray( objDefinition ) || typeof objDefinition === 'string' ) {
			throw new Error( 'When adding an element, the definition must be an object. Please see the documentation for help.' );
		}

		// We want to get all possible parameters in the system
		// regardless of whether they are active or not
		currentItems = this.manager.getAllNames();

		Object.keys( objDefinition ).forEach( function ( name ) {
			var definition = objDefinition[ name ],
				element = definition;

			if ( currentItems.indexOf( name ) > -1 ) {
				// Skip if item already exists with this name
				return;
			}

			if ( Array.isArray( definition ) ) {
				// Sanity check, filter so there are only actual elements
				element = definition.filter( function ( el ) {
					return el instanceof Element;
				} );
			}

			// Check if there are current values from the URL
			// those override any other values in the DOM or
			// system
			urlParams = controller.parseQueryString();
			value = urlParams[ name ];

			// Add to the manager
			controller.manager.addItems( [
				new fr.Element( element, name, value )
			] );
		} );
	};

	/**
	 * Start the system, or a specific element-parameter
	 *
	 * @param {string} [name] Element name
	 */
	fr.Controller.prototype.start = function ( name ) {
		this.manager.start( name );
	};

	/**
	 * Stop the system, or a specific element-parameter
	 *
	 * @param {string} [name] Element name
	 */
	fr.Controller.prototype.stop = function ( name ) {
		this.manager.stop( name );
	};

	/* istanbul ignore next */
	/**
	 * Destroy the instance, disconnect from events
	 */
	fr.Controller.prototype.destroy = function () {
		this.manager.destroy();
		this.manager.disconnect( this );
	};
}() );
