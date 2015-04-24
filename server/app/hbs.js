define(['handlebars', 'handlebars/intl', 'hbs/config', 'handlebars/intl/ru'], function (hbs, intl, config)
{
	'use strict';

	// Регистрируем плагин intl
	intl.registerWith(hbs);

	// Плагин для ресайза
	if (config.resizeUrl || false)
	{
		if (!/\/$/.test(config.resizeUrl))
			config.resizeUrl += '/';

		hbs.registerHelper('resize', function (url, size)
		{
			if (!size)
				return url;

			// TODO Consider relative paths
			return config.resizeUrl + size + '/' + url;
		});
	} else
	{
		hbs.registerHelper('resize', function (url)
		{
			return url;
		});
	}

	return {
		load: function (name, parentRequire, onload)
		{
			$.get(parentRequire.toUrl(name + '.hbs'), 'html')
				.done(function (source)
				{
					var template = hbs.compile(source);
					onload(template);
				})
				.fail(function (jqXHR, textStatus)
				{
					onload.error({
						xhr   : jqXHR,
						status: textStatus
					});
				});
		}
	}
});