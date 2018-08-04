( function () {
	/**
	 * Element model, wrapping the behavior of DOM elements
	 *
	 * @class
	 * @mixin OO.EventEmitter
	 *
	 * @constructor
	 * @param {Element} DOMElement The DOM element or an array
	 *  of DOM elements that are grouped, like a group of
	 *  checkboxes or a group of radio inputs.
	 * @param {string} [name] Element name
	 */
	fr.Element = function FrElement( DOMElement, name ) {
		var i, options,
			that = this;

		// Mixin constructor
		OO.EventEmitter.call( this );
		OO.EmitterList.call( this );

		this.name = name;
		this.element = DOMElement;
		this.active = false;

		this.cachedValue = null;
		this.options = [];
		this.optionValues = [];

		// Initialize type
		if (
			Array.isArray( DOMElement ) ||
			DOMElement instanceof NodeList
		) {
			// Array of radio buttons or checkboxes

			// Sanity check: Filter only to the same type
			this.element = DOMElement.filter( function ( el ) {
				return el.type === DOMElement[ 0 ].type;
			} );

			if (
				this.element[ 0 ].type !== 'checkbox' &&
				this.element[ 0 ].type !== 'radio'
			) {
				throw new Error( 'An array of elements must be of checkbox or radio type.' );
			}

			// 'checkbox-group' or 'radio-group'
			this.type = this.element[ 0 ].type + '-group';
		} else {
			this.type = this.element.type;
		}

		// Fill in options
		if (
			this.getType() === 'select-one' ||
			this.getType() === 'select-multiple'
		) {
			// Store all options in an actual array
			options = this.element.options;

			for ( i = 0; i < options.length; i++ ) {
				this.options[ i ] = this.element.options[ i ];
				this.optionValues[ i ] = this.element.options[ i ].value;
			}
		} else if (
			this.getType() === 'radio-group' ||
			this.getType() === 'checkbox-group'
		) {
			this.element.forEach( function ( opt ) {
				that.options.push( opt );
				that.optionValues.push( opt.value );
			} );
		}

		// Initialize values
		// We do this so that if a DOM element was written
		// with invalid values, they will be corrected
		this.setValue( this.getValue() );
	};

	/* Initialization */
	OO.initClass( fr.Element );
	OO.mixinClass( fr.Element, OO.EventEmitter );
	OO.mixinClass( fr.Element, OO.EmitterList );

	/* Events */

	/**
	 * @event update
	 * @param {string|boolean|number} value Element value
	 *
	 * The element value changed
	 */

	/* Methods */

	/**
	 * Get the element details
	 *
	 * @return {Object} Object representing element details
	 */
	fr.Element.prototype.getDetails = function () {
		var result = { type: this.getType() };

		switch ( this.getType() ) {
			case 'number':
				result.range = {
					min: this.element.min !== '' ? Number( this.element.min ) : null,
					max: this.element.max !== '' ? Number( this.element.max ) : null
				};
				break;
			case 'radio-group':
			case 'checkbox-group':
			case 'select-one':
			case 'select-multiple':
				result.options = this.getOptionValues();
				// TODO: Make this configurable
				result.separator = ',';
				break;
			// Not represented: checkbox, text
		}

		return result;
	};

	/**
	 * Set element value
	 *
	 * @param {string|boolean|number} newValue [description]
	 * @fires update
	 */
	fr.Element.prototype.setValue = function ( newValue ) {
		var i, options;
		newValue = this.normalizeValue( newValue );

		if ( !this.compareValues( this.cachedValue, newValue ) ) {
			switch ( this.getType() ) {
				case 'checkbox-group':
					for ( i = 0; i < this.element.length; i++ ) {
						this.element[ i ].checked = newValue.indexOf( this.element[ i ].value ) > -1;
					}
					break;
				case 'select-multiple':
					options = this.element.options;

					for ( i = 0; i < options.length; i++ ) {
						options[ i ].selected = newValue.indexOf( options[ i ].value ) > -1;
					}
					break;
				case 'checkbox':
					this.element.checked = newValue;
					break;
				case 'radio-group':
					for ( i = 0; i < this.element.length; i++ ) {
						this.element[ i ].checked = this.element[ i ].value === newValue;
					}
					break;
				default:
					this.element.value = newValue;
					break;
			}

			this.cachedValue = newValue;
			this.emit( 'update', newValue );
		}
	};

	/**
	 * Get the element's current value
	 *
	 * @return {string|boolean|number} Current value
	 */
	fr.Element.prototype.getValue = function () {
		var arr, selected;

		switch ( this.getType() ) {
			case 'number':
				return Number( this.element.value );
			case 'select-multiple':
				arr = [];
				this.options.forEach( function ( opt ) {
					if ( opt.selected ) {
						arr.push( opt.value );
					}
				} );
				return arr;
			case 'checkbox':
				return this.element.checked;
			case 'checkbox-group':
				return this.element
					.filter( function ( check ) {
						return check.checked;
					} )
					.map( function ( check ) {
						return check.value;
					} );
			case 'radio-group':
				selected = this.element
					.filter( function ( radio ) {
						return radio.checked;
					} )[ 0 ];
				return selected ? selected.value : this.optionValues[ 0 ];
			case 'text':
			case 'select-one':
			default: // Assuming type 'string', where input allows freetext
				return this.element.value;
		}
	};

	/**
	 * Normalize a given value for the element type.
	 *
	 * @param {string|boolean|number} value Given value
	 * @return {string|boolean|number} Normalized value
	 */
	fr.Element.prototype.normalizeValue = function ( value ) {
		var that = this;

		switch ( this.getType() ) {
			case 'number':
				if ( this.element.min || this.element.max ) {
					if ( !isNaN( value ) ) {
						// If number, check if inside the range
						if ( this.element.min && Number( value ) < this.element.min ) {
							return Number( this.element.min );
						}

						if ( this.element.max && Number( value ) > this.element.max ) {
							return Number( this.element.max );
						}

						return Number( value );
					} else {
						// If completely invalid (not a number) return minimum value
						return Number( this.element.min );
					}
				} else {
					// If there are no limits, return the number, or 0
					return !isNaN( value ) ? Number( value ) : 0;
				}
			case 'radio-group':
			case 'select-one':
				return this.getOptionValues().indexOf( value ) > -1 ?
					value :
					// TODO: Change this to default?
					this.options[ 0 ].value;
			case 'checkbox':
				return !isNaN( value ) ?
					!!Number( value ) :
					!!value;
			case 'checkbox-group':
			case 'select-multiple':
				value = Array.isArray( value ) ? value : [ value ];
				// Clean up invalid values
				value = value.filter( function ( val, index, self ) {
					return self.indexOf( val ) === index &&
						that.getOptionValues().indexOf( val ) > -1;
				} );
				return value;
			default:
				return String( value );
		}
	};

	fr.Element.prototype.compareValues = function ( arr1, arr2 ) {
		var i, arrCheck, index;

		if ( !Array.isArray( arr1 ) || !Array.isArray( arr2 ) ) {
			// Compare non-arrays
			return arr1 === arr2;
		}

		// Compare lengths first
		if ( arr1.length !== arr2.length ) {
			return false;
		}

		arrCheck = arr2.slice( 0 );
		while ( arrCheck.length ) {
			for ( i = 0; i < arr1.length; i++ ) {
				index = arrCheck.indexOf( arr1[ i ] );

				if ( index === -1 ) {
					// Arrays aren't equal
					return false;
				}

				// Still equal; remove that value from arrCheck
				arrCheck.splice( index, 1 );
			}
		}

		return true;
	};

	/**
	 * Toggle the active state of the element.
	 *
	 * @param  {boolean} isActive Element is active
	 * @fires active
	 */
	fr.Element.prototype.toggle = function ( isActive ) {
		isActive = isActive === undefined ? !this.active : !!isActive;

		if ( this.active !== isActive ) {
			this.active = isActive;
			this.emit( 'active', this.active );
		}
	};

	fr.Element.prototype.isActive = function () {
		return this.active;
	};

	fr.Element.prototype.getType = function () {
		return this.type;
	};

	fr.Element.prototype.getName = function () {
		return this.name;
	};

	fr.Element.prototype.getOptionValues = function () {
		return this.optionValues;
	};
}() );
