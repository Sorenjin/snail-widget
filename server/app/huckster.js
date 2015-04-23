/**
 * Created by cyberex on 12.03.15.
 */
require(
	['huckster/api', 'huckster/config', 'huckster/client-config', 'jquery'],
	function (eh, config, clientConfig, $)
	{
		config.versions = config.versions || {};
		var vConfig = {};

		eh.setCompanyId(clientConfig.companyId || 0);

		function setConfigVersion(ver)
		{
			vConfig = $.extend({
				templateSuffix : '',
				cssSuffix      : '',
				buttonStoreMode: 'storage',
				sliderConfig   : {},
				buttonConfig   : {
					show: false
				}
			}, config.versions[ver], true);
		}

		var dialogOpened = false;
		var floatingButton;

		function showButton(showDescription)
		{
			showDescription = showDescription || false;

			if (!vConfig.buttonConfig.show)
				return;

			require(['floating-button'], function (FB)
			{
				var provider = eh.getProvider();

				if (floatingButton)
					floatingButton
						.setOptions({
							showDescription: showDescription
						})
						.show();
				else
					floatingButton = new FB({
						click          : function ()
						{
							provider.send({
								open: true
							})
						},
						text           : vConfig.buttonConfig.label || 'Экономь с нами',
						description    : 'В любой момент нажмите<br>на кнопку и узнайте скидку<br>на понравившиеся вам товары',
						showDescription: showDescription
					});

				floatingButton.show();
			});
		}

		eh
			.on('wtype', function (e, v)
			{
				if (v < 1 || v > 3)
					v = 1;

				setConfigVersion('v' + v);
			})
			.on('offers', function (e, offers)
			{
				if (!offers || dialogOpened)
					return;

				dialogOpened = true;

				if (floatingButton)
					floatingButton.hide();

				var p = this;

				require([
						'jquery',
						'hbs!huckster/tpl/window' + vConfig.templateSuffix,
						'css!huckster/tpl/window' + vConfig.cssSuffix,
						'jquery/owl.carousel'
					],
					function ($, template)
					{
						$.each(offers, function (i, offer)
						{
							offer.discount = (100 - offer.sale / offer.price * 100).toFixed();
							offer.title = decodeURIComponent(offer.title);
							offer.active = offer.active || false;
						});

						$('body').append(template({
							offers: offers
						}));

						$('.discount-modal .owl-carousel').owlCarousel(vConfig.sliderConfig);

						p.send({
							widget: true
						});

						$('.discount-modal .owl-carousel .item').removeClass('faded');

						function closeDialog()
						{
							$('.ov, .discount-modal').remove();
							dialogOpened = false;
						}

						$('.discount-modal .close').on('click', function ()
						{
							p.send({
								canceled: true
							});

							switch (vConfig.buttonStoreMode)
							{
								case 'storage':

									require(['jquery', 'jquery/storage'], function ($)
									{
										// Устанавливаем флаг в локальном хранилище для отображения кнопки
										var ls = $.initNamespaceStorage('huckster').localStorage;

										ls.set('showButton', true);

										showButton(true);
									});

									break;

								case 'query':

									showButton(true);

									break;
							}

							closeDialog();
						});

						var $discountModal = $('.discount-modal');

						$discountModal
							.on('click', '.item', function (e)
							{
								e.preventDefault();
								$(this).toggleClass('selected');
							})
							.on('click', '.what-is', function (e)
							{
								e.preventDefault();

								$('.discount-s').hide();
								$('.help-s').show();
							})
							.on('click', '.go-back', function (e)
							{
								e.preventDefault();

								$('.discount-s').show();
								$('.help-s').hide();
							});

						var $hucksterPhone = $("#huckster-phone");
						//$hucksterPhone.mask("+7(999) 999-99-99");

						$discountModal
							.find('.phone-form').on('submit', function (e)
							{
								e.preventDefault();

								var $selected = $discountModal.find('.item.selected');
								if ($selected.length == 0)
								{
									alert('Пожалуйста, выберите одно из предложений');
									return;
								}

								var phone = $hucksterPhone.val();
//						if (phone == '')
//						{
//							alert('Пожалуйста, укажите номер телефона');
//							return;
//						}

								var offers = [];
								$selected.each(function ()
								{
									offers.push($(this).data('item-id'))
								});

								try
								{
									var phoneEncoded = encodeURIComponent(phone);
									if (phoneEncoded === undefined || phoneEncoded == '')
										phoneEncoded = phone;
								} catch (e)
								{
									phoneEncoded = phone;
									var error = e;
								}
								var data = {
									offers: offers,
									phone : phoneEncoded
								};

								p.send(data);
								if (error || false)
									data.error = error.message || 'Unknown';

								if (vConfig.buttonStoreMode == 'storage')
									require(['jquery', 'jquery/storage'], function ($)
									{
										var ls = $.initNamespaceStorage('huckster').localStorage;

										ls.remove('showButton');
									});

								closeDialog();
							});
					})
			})
			.on('order', function (e, data)
			{
				if (data === true)
					require(['jquery'], function ($)
					{
						$('<div>Ваша заявка на скидку оформлена! В ближайшее время с вами свяжется оператор.</div>')
							.dialog({
								title: 'Спасибо за ваш выбор!',
								modal: true,
								close: function ()
								{
									$(this).remove();
								}
							});
					})
			})
			.on('button', function (e, data)
			{
				if ((data.button || false) === true)
					showButton(false);
			});

		setConfigVersion(config.defaultVersion || 'v1');

		if (vConfig.buttonConfig.show)
			switch (vConfig.buttonStoreMode)
			{
				case 'storage':

					require(['jquery', 'jquery/storage'], function ($)
					{
						var ls = $.initNamespaceStorage('huckster').localStorage;

						if (ls.get('showButton'))
							showButton(false);
					});

					break;
			}

		window.huckster_echo = function (data, companyId, clientId)
		{
			data.companyid = companyId;
			data.clientid = clientId;

			eh.getProvider().send({
				echo: data
			});
		};

		window.huckster_test_offers = function (v, companyId, clientId)
		{
			huckster_echo({
				echo: {
					companyid: companyId,
					clientid : clientId,
					wtype: v || 1,
					offers   : [
						{
							"offerid" : 12,
							"title"   : "СНЕГОУБОРЩИК ЭЛЕКТРИЧЕСКИЙ PROFI P200046",
							"image"   : "http://neva-center.ru/m/item/images/16531/img1928.jpg",
							"price"   : 12300,
							"sale"    : 12000,
							"discount": 300 // <-- NOTE Это не проценты!
						},
						{
							"offerid" : 13,
							"title"   : "КАНИСТРА ТОПЛИВНАЯ 5Л. ЗЕЛЕНАЯ OREGON",
							"image"   : "http://neva-center.ru/m/item/images/00000008673/kartinka.jpg",
							"price"   : 15500,
							"sale"    : 15000,
							"discount": 500
						},
						{
							"offerid" : 12,
							"title"   : "СНЕГОУБОРЩИК ЭЛЕКТРИЧЕСКИЙ PROFI P200046",
							"image"   : "http://neva-center.ru/m/item/images/00000009612/cache/echo5800_120_120.jpg",
							"price"   : 12300,
							"sale"    : 12000,
							"discount": 300,
							active    : true
						},
						{
							"offerid" : 13,
							"title"   : "КАНИСТРА ТОПЛИВНАЯ 5Л. ЗЕЛЕНАЯ OREGON",
							"image"   : "http://neva-center.ru/m/item/images/00000007755/cache/echo2takta01l_120_120.jpg",
							"price"   : 15500,
							"sale"    : 15000,
							"discount": 500
						},
						{
							"offerid" : 12,
							"title"   : "СНЕГОУБОРЩИК ЭЛЕКТРИЧЕСКИЙ PROFI P200046",
							"image"   : "http://neva-center.ru/m/item/images/00000006150/cache/cj7y_120_120.jpg",
							"price"   : 12300,
							"sale"    : 12000,
							"discount": 300
						}
					]
				}
			});
		};
	},
	function (err)
	{
		var failedId = err.requireModules && err.requireModules[0];
		if (failedId === 'huckster/client-config')
		{
			requirejs.undef(failedId);

			define('huckster/client-config', [], function ()
			{
				return {
					companyId: 0
				}
			});

			require(['huckster/client-config']);
		} else
		{
			throw err;
		}
	}
);