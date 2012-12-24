
var Map = (function( utils, MapFacade ){

	function Map( name, config ){

		config = ( typeof config == 'object' ? config : {} );

		// set our error handler
		this.errorHandler = config.errorHandler || function( e ){ throw e; };

		// check the maps name is valid
		this.checkName( name, true );

		// each map is given it's own name to aid recognition and error formatting.
		this.name = name;

		// where we store all objects within the map.
		this.map = {};

		// any matching event callbacks (get/add/remove) are called when appropriate
		this.eventCallbacks = config.callbacks || {};

		// set context of the callbacks (if any)
		this.callbacksContext = config.callbacksContext || null;

		// states the number of items in the map
		this.length = 0;
		
		// return a sandboxed object
		return new MapFacade( this );

	}

	Map.prototype = {

		// returns the maps name
		getName : function(){
			return ( typeof this.name == 'string' ? this.name : null );
		},

		// returns map name with greater context
		getMapName : function(){
			var name = this.getName();
			return name ? ' object [inside \'' + name + '\' map]' : '';
		},

		// checks that a supplied map name is valid
		checkName : function( name, map ){
			// ensure that we've been provided a correct name
			if( typeof name !== 'string' && typeof name !== 'number' ){
				this.errorHandler( new Error('Name must be provided') );
			}
			if( typeof name == 'string' && ( name.split(' ').join('').length < 1 || name === '' ) ){
				this.errorHandler( new Error('Name must not be empty') );
			}
		},

		// fires any matching event callbacks that were set initially.
		fireEvent : function( event, id, obj ){
			if( event && typeof this.eventCallbacks[ event ] == 'function' ){
				this.eventCallbacks[ event ].call( this.callbacksContext, this.name, id, obj );
			}
		},

		// gets a single object within the map
		GET_SINGLE : function( id ){
			if( typeof this.map[ id ] === 'undefined' ){
				this.errorHandler( new Error( 'Object "' + id + '" was requested but not found.') );
			}
			this.fireEvent( 'get', id, this.map[id] );
			return this.map[ id ];
		},

		// sets a single object within the map
		SET_SINGLE : function( id, obj ){

			// ensure that the name is valid
			try{
				this.checkName( id );
			} catch ( e ){
				var message = e.message + "\nSo failed to add an" + this.getMapName();
				this.errorHandler( e, message );
			}

			// install events aggregator onto the object
			if( typeof obj.on === 'undefined'){
				utils.installEventsTo( obj );
			}

			// store the object into the map
			this.map[id] = obj;

			// increment length and fire add event
			this.length++;
			this.fireEvent( 'add', id, obj );
			
			return obj;
		},

		// sets a single object within the map
		SET_MULTIPLE : function( mappings ){
			if( typeof mappings !== 'object'){
				this.errorHandler( new Error( 'Cannot set multiple map objects - mappings argument is not an object.' ) );
			}
			// for each object passed through
			for( var i in mappings ){
				var id = i,
					instance = mappings[i];
				if( typeof instance != 'object' ){
					this.errorHandler( new Error( 'Map object not found - was of type ' + typeof instance ) );
				}
				// set each instance
				this.SET_SINGLE( id, instance );
			}
			return this;
		},

		// removes a single object within the map
		REMOVE_SINGLE : function( id ){
			this.fireEvent( 'remove', id, this.map[id] );
			if( typeof this.map[id] !== 'undefined' ){
				this.map[id] = null;
				delete this.map[id];
				this.length--;
			}
			return this;
		},

		// removes all objects within the map
		REMOVE_MULTIPLE : function(){
			for( var id in this.map ){
				this.REMOVE_SINGLE( id );
			}
			return this;
		},

		// calls a method on a single object within the map.
		INVOKE_SINGLE_METHOD : function( id, method, arg1, arg2, argN ){
			if ( this.map[ id ] ){
				try {
					if( typeof this.map[id][method] == 'function' ){
						var args = Array.prototype.slice.call( arguments, 2 );
						return this.map[id][method].apply( this.map[id], args );
					} else {
						throw new Error( 'The method "' + method + '()" is not defined on ' + id + '.');
					}
				} catch (e) {
					var message = e.message + "\nSo method '" + method + "()' failed on '" + id + "'" + this.getMapName();
					this.errorHandler( e, message );
				}
			}
		},

		// same as above but no error if the method doesn't exist on the object.
		INVOKE_SINGLE_METHOD_IF_EXISTS : function( id, method, arg1, arg2, argN ){
			if ( this.map[ id ] && typeof this.map[id][method] == 'function' ){
				var args = Array.prototype.slice.call( arguments, 2 );
				return this.map[id][method].apply( this.map[id], args );
			}
		},

		// gets a single object within the map and then injects it into a callback
		INVOKE_SINGLE_CALLBACK : function( id, callback, context ){
			if( this.map[ id ] ){
				try {
					return callback.call( context || this.map[ id ], this.map[id], id );
				} catch (e){
					// throw recursive errors to prevent masking
					if( e.name == 'ModuleException' ){ throw e; } else {
						var message = e.message + "\nSo callback failed on '" + id + "'" + this.getMapName();
						this.errorHandler( e, message );
					}
				}
			}
		},

		// each object in the map is injected into the callback
		INVOKE_MULTIPLE_CALLBACK : function( callback, context ){
			for( var id in this.map ){
				this.INVOKE_SINGLE_CALLBACK( id, callback, context );
			}
			return this;
		},

		// calls a defined method on each object within the map
		INVOKE_MULTIPLE_METHOD : function( method, arg1, arg2, argN ){
			for( var id in this.map ){
				var args = Array.prototype.slice.call( arguments, 0 );
				Array.prototype.unshift.call( args, id );
				this.INVOKE_SINGLE_METHOD.apply( this, args );
			}
			return this;
		},

		// calls a method on each object in the map if the method exists.
		INVOKE_MULTIPLE_METHOD_IF_EXISTS : function( method, arg1, arg2, argN ){
			for( var id in this.map ){
				var args = Array.prototype.slice.call( arguments, 0 );
				Array.prototype.unshift.call( args, id );
				this.INVOKE_SINGLE_METHOD_IF_EXISTS.apply( this, args );
			}
			return this;
		}
	};

	return Map;

})( utils, MapFacade );