( function () {
	fr.ParamModel = function FrParamModel() {
		// Mixin constructor
		OO.EventEmitter.call( this );
		OO.EmitterList.call( this );
	};

	/* Initialization */
	OO.initClass( fr.ParamModel );
	OO.mixinClass( fr.ParamModel, OO.EventEmitter );
	OO.mixinClass( fr.ParamModel, OO.EmitterList );
}() );
