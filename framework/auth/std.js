/**
 * @class  	Auth.Std
 * @author  Flavio De Stefano <flavio.destefano@caffeinalab.com>
 */

/**
 * @property config
 * @property {String} [config.loginUrl=false] Override URL to login-in
 */
exports.config = _.extend({
	loginUrl: false
}, (Alloy.CFG.T && Alloy.CFG.T.auth) ? Alloy.CFG.T.auth.std : {});

exports.login = function(opt) {
	if (opt.data == null) {
		throw new Error('Auth: set data when calling Auth.login');
	}

	Ti.App.Properties.setObject('auth.std.data', opt.data);
	opt.success(opt.data);
};

exports.logout = function() {
	Ti.App.Properties.removeProperty('auth.std.data');
};

exports.isStoredLoginAvailable = function() {
	return Ti.App.Properties.hasProperty('auth.std.data');
};

exports.storedLogin = function(opt) {
	if (exports.isStoredLoginAvailable()) {
		opt.success(Ti.App.Properties.getObject('auth.std.data'));
	} else {
		opt.error();
	}
};