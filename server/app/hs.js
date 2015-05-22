(function ()
{
	var config = window.hucksterConfig || {};
	var server = '//' + config.server + '/app/';

	var hucksterContext = require.config({

		context: 'huckster',
		baseUrl: server,

		shim: {
			'jquery/owl.carousel': {
				deps: ['css!./owl.carousel/style']
			},
			'handlebars/intl'    : {
				deps   : ['handlebars'],
				exports: 'HandlebarsIntl'
			},
			'handlebars/intl/ru' : ['handlebars/intl'],
			'jquery/pgwbrowser'  : {
				deps: ['jquery']
			}
		}
	});
	if (window.jQuery !== undefined)
	{
		define('jquery', [], function ()
		{
			return jQuery;
		});
	}
	hucksterContext(['huckster'], function (hs)
	{
		hs(config);
	});
	require.config({
		context: '_'
	});
})();