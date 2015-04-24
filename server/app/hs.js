(function ()
{
	var server = '//test2.snail.ru/app/';

	require.config({

		paths: {
			'huckster'       : server + 'huckster',
			'cookies'        : server + 'cookies',
			'hbs'            : server + 'hbs',
			'css'            : server + 'css',
			'handlebars'     : server + 'handlebars',
			'floating-button': server + 'floating-button'
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
	if (jQuery !== undefined)
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
})();