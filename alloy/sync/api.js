/*
 * @author  Flavio De Stefano <flavio.destefano@caffeinalab.com>
 */

var HTTP = require('T/http');
var CRUD_to_REST = {
	'create': 'POST',
	'read': 'GET',
	'update': 'PUT',
	'delete': 'DELETE',
	'patch': 'PATCH'
};

exports.sync = function(method, model, opt) {
	var url = (model.config.adapter.baseUrl || '/') + model.config.adapter.name;

	if ((model instanceof Backbone.Model) && model.id != null) {
		url += '/' + model.id;
	}

	if (model.query != null) {
		if (_.isObject(model.query) || _.isArray(model.query)) {
			url += require('T/util').buildQuery(model.query);
		} else if (_.isString(model.query)) {
			url += model.query.substr(0,1) === '?' ? model.query : ('?'+model.query);
		}
	}

	if (opt.patch) method = 'patch';

	var httpOpt = _.extend({}, model.config.http, opt.http, {
		url: url,
		method: CRUD_to_REST[method] || 'GET',
		format: 'json'
	});

	if (Alloy.Backbone.emulateHTTP) {
		if ([ 'DELETE', 'PUT', 'PATCH' ].indexOf(httpOpt.method) !== -1) {
			httpOpt.method = 'POST';
			httpOpt.headers = _.extend({}, httpOpt.headers, {
				'X-HTTP-Method-Override': httpOpt.method
			});
		}
	}

	switch (method) {

		case 'create':

		_.extend(httpOpt, { data: JSON.stringify(model.toJSON()) });
		HTTP.send(httpOpt).success(function(resp) {

			if (resp != null && resp.id != null) {
				opt.success(resp);
			} else {
				opt.error();
			}

		}).error(opt.error);
		break;

		case 'read':

		HTTP.send(httpOpt).success(function(resp) {

			if (resp != null) {
				if (model instanceof Backbone.Collection) {

					if (_.isObject(resp)){
						opt.success(resp.data || resp.results || resp.result);
					} else if (_.isArray(resp)) {
						opt.success(resp);
					} else {
						opt.error();
					}

				} else {
					opt.success(resp);
				}
			} else {
				opt.error();
			}

		}).error(opt.error);
		break;

		case 'update':

		if (opt.patch) {
			_.extend(httpOpt, { data: JSON.stringify(_.pick(model.attributes, _.keys(opt.changes))) });
		} else {
			_.extend(httpOpt, { data: JSON.stringfiy(model.toJSON()) });
		}

		HTTP.send(httpOpt).success(function(resp) {

			if (resp != null) {
				opt.success();
			} else {
				opt.error();
			}

		}).error(opt.error);
		break;

		case 'delete':

		HTTP.send(httpOpt).success(function(resp) {

			if (resp != null) {
				opt.success();
			} else {
				opt.error();
			}

		}).error(opt.error);
		break;

	}
};