(function ()
{
	var server = '//test2.snail.ru/app/';

	require.config({

		paths: {
			'huckster'           : server + 'huckster',
			'cookies'            : server + 'cookies',
			'hbs'                : server + 'hbs',
			'css'                : server + 'css',
			'handlebars'         : server + 'handlebars',
			'floating-button'    : server + 'floating-button',
			'jquery/owl.carousel': server + 'jquery/owl.carousel',
			'jquery/pgwbrowser'  : server + 'jquery/pgwbrowser',
			'jquery2.1.3'        : server + 'jquery'
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
		},

		map: {
			'jquery/owl.carousel': {
				'jquery': 'jquery2.1.3'
			},
			'jquery/pgwbrowser'  : {
				'jquery': 'jquery2.1.3'
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
		require.config({
			paths: {
				'jquery': server + 'jquery'
			}
		});
//	define('jquery2.1.3', ['jquery'], function (jq)
//	{
//		return jq.noConflict(true);
//	});
})();