Ext.define('RedAmp.lastfm.api.Api', {
	extend: 'Ext.util.Observable',
	singleton: true,
	
	///////////////////////////////////////////////////////////////////////////
	// Requires
	///////////////////////////////////////////////////////////////////////////
	requires:[
		'RedAmp.util.Util'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	url: '/request/last-fm/api/',
	key: '6c3d64c191c37cac16abe99b3f1301be',
	authenticated: false,
	session: false,
	cookieKey: 'lastfm-api',
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	constructor: function(){
		this.callParent(arguments);
		this.init();
	},
	
	init: function(){
		//Try to get the cookie
		//Ext.util.Cookies.clear(this.cookieKey);
		var cookie = Ext.util.Cookies.get(this.cookieKey);
		if(cookie != null){
			this.setSession(Ext.decode(cookie));
			console.log(this.getSession());
		}
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	authenticate: function(params){
		this.request({
			scope: this,
			signed: true,
			module: 'auth',
			method: 'getSession',
			params: params,
			callback: function(response){
				this.setSession(response.session);
				Ext.util.Cookies.set(this.cookieKey, Ext.encode(this.session));
			}
		});
	},
	
	//module, method, params, callback, scope, signed, type=GET/POST
	request: function(config){
		//Send the request
		this.doRequest(this.getRequestConfig(config));
	},
	
	doRequest: function(config){
		
		//Handle signed or unsigned
		config.url = this.getRequestUrl();
		if(config.signed){
			//Change the url
			config.url = this.getSignedRequestUrl();
			
			//Add the session key
			if(this.isAuthenticated() && this.getSession()){
				Ext.apply(config.params, {
					sk: this.getSession().key
				});
			}
		}
		
		//Handle the type
		Ext.apply(config.params, {
			"_type": config.type
		});
		delete config.type;
		
		//Handle the callback
		config.customCallback = config.callback;
		delete config.callback;
		
		//Run the request
		Ext.Ajax.request(Ext.apply(config, {
			timeout: 15000,
			disableCaching: false,
			method: 'POST',
			success: function(response, request){
				var responseObject = Ext.decode(response.responseText);
				Ext.bind(request.customCallback, request.scope)(responseObject);
			},
			failure: function(response, request){
				Ext.bind(request.customCallback, request.scope)({
					success: false
				});
			}
		}));
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Accessors
	///////////////////////////////////////////////////////////////////////////
	getSession: function(){
		return this.session;
	},
	
	getRequestConfig: function(config){
		//Make sure config is not null
		if(config == null){
			config = {};
		}
		
		//Create the default config
		var defaultConfig = {
			scope: this,
			signed: false,
			type: 'get',
			module: '',
			method: '',
			params: {},
			callback: Ext.emptyFn
		};
		
		//Apply the default config
		Ext.apply(defaultConfig, config);
		
		//Process the params
		config.params = this.getParams(config.module, config.method, config.params);
		
		//Return the config
		return config;
	},
	
	getParams: function(module, method, params){
		//Make sure params is not null
		if(params == null){
			params = {};
		}
		
		return Ext.apply(params, {
			method: module + '.' + method
		});
	},
	
	getRequestUrl: function(){
		return this.url + 'request';
	},
	
	getSignedRequestUrl: function(){
		return this.url + 'signed-request';
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Mutators
	///////////////////////////////////////////////////////////////////////////
	setSession: function(session){
		this.authenticated = true;
		this.session = session;
		this.fireEvent('authenticate', this, this.session);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Checkers
	///////////////////////////////////////////////////////////////////////////
	isAuthenticated: function(){
		return this.authenticated;
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	onAuthentication: function(callback, scope, options){
		if(scope == null){
			scope = this;
		}
		if(options == null){
			options = {};
		}
		
		if(this.isAuthenticated()){
			Ext.bind(callback, scope)(this, this.session, options);
		}
		else{
			this.on('authenticate', function(module, session, options){
				Ext.bind(options.callback, options.scope)(this, session, options.options);
			}, this, {single: true, callback: callback, scope: scope, options: options});
		}
	}
});