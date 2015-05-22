(function ()
{
	var config = window.hucksterConfig || {};
	var server = '//' + config.server + '/app/';

	var hucksterContext = require.config({

		paths: {
			'huckster'           : server + 'huckster',
			'cookies'            : server + 'cookies',
			'hbs'                : server + 'hbs',
			'css'                : server + 'css',
			'handlebars'         : server + 'handlebars',
			'floating-button'    : server + 'floating-button',
			'jquery/owl.carousel': server + 'jquery/owl.carousel',
			'jquery/pgwbrowser'  : server + 'jquery/pgwbrowser'
		},

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
	else
		hucksterContext.config({
			paths: {
				'jquery': server + 'jquery'
			}
		});
	define('huckster/client-config', [], function ()
	{
		return config;
	});
	hucksterContext(['require'], function (require)
	{
		require(['huckster']);
	});
	require.config({
		context: '_'
	});
})();