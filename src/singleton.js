( function () {
	var instance = new fr.Controller();
	return {
		add: instance.add.bind( instance ),
		stop: instance.stop.bind( instance ),
		start: instance.start.bind( instance ),
		// connect: instance.connect,
		reload: function ( config ) {
			if ( instance ) {
				// Disconnect the previous instance first
				instance.destroy();
			}

			instance = new fr.Controller( config );
		}
	};
}() );
