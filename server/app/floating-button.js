/**
 * Created by cyberex on 09.04.15.
 */

define(['jquery', 'require'], function ($, require)
{
	function FloatingButton(config)
	{
		var options = $.extend({
			click          : function ()
			{
				// Do nothing
			},
			text           : '',
			description    : '',
			showDescription: false
		}, config, true);

		this.getOptions = function ()
		{
			return options;
		};

		this.setOptions = function (settings)
		{
			options = $.extend(options, settings, true);

			return this;
		};

		var button;
		this.setButton = function (b)
		{
			button = b;

			return this;
		};
		this.getButton = function ()
		{
			return button;
		};
	}

	FloatingButton.prototype.show = function ()
	{
		var self = this;

		require(['hbs!floating-button/tpl/button', 'css!floating-button/tpl/button'], function (fbt)
		{
			var $button = self.getButton(),
				options = self.getOptions();

			if ($button === undefined)
			{
				$button = $(fbt({
					text       : options.text,
					description: options.description
				}));

				$button.find('.floating-btn').click(function (e)
				{
					e.preventDefault();

					options.click.apply(this, arguments);
				});

				self.setButton($button);

				$('body').append($button);
			}
			else
				$button.show();

			var $once = $button.find('.show-once').add($button.not('.show-once'));
			if (options.showDescription)
			{
				$once.show();

				setTimeout(function ()
				{
					$once.fadeOut();
				}, 2000);
			}
			else
				$once.hide();
		})
	};

	FloatingButton.prototype.hide = function ()
	{
		var $button = this.getButton();
		if ($button)
			$button.hide();
	};

	return FloatingButton;
});