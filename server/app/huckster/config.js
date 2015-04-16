define(function ()
{
	return {
		clientId      : 1,
		defaultVersion: 'v1',
		versions      : {
			v1: {
				templateSuffix : '-v1',
				cssSuffix      : '-v1',
				sliderConfig   : getSliderConfig('v1')
			},
			v2: {
				templateSuffix : '-v2-v3',
				cssSuffix      : '-v1',
				buttonStoreMode: 'query',
				sliderConfig   : getSliderConfig('v1'),
				buttonConfig   : getButtonConfig('v2')
			},
			v3: {
				templateSuffix : '-v2-v3',
				cssSuffix      : '-v1',
				buttonStoreMode: 'query',
				sliderConfig   : getSliderConfig('v1'),
				buttonConfig   : getButtonConfig('v3')
			}
		}
	};

	function getSliderConfig(v)
	{
		switch (v)
		{
			case 'v0':

				return {
					lazyLoad     : true,
					center       : true,
					items        : 2,
					startPosition: 2,
					nav          : true,
					responsive   : {
						900: {
							items: 5
						}
					}
				};

			case 'v1':

				return {
					lazyLoad     : true,
					center       : false,
					items        : 1,
					startPosition: 0,
					nav          : true,
					responsive   : {
						900: {
							items: 3
						}
					}
				}
		}
	}

	function getButtonConfig(v)
	{
		switch (v)
		{
			case 'v2':

				return {
					show : true,
					label: 'Получи купон<br/>на скидку'
				};

			case 'v3':

				return {
					show : true,
					label: 'Экономь с нами'
				};
		}
	}
});