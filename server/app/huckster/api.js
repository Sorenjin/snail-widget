define(
	['jquery/pgwbrowser', 'cookies'],
	function (undefined, Cookies)
	{
		var provider,
			events = {},
			companyId = 0,
			eventsHandler = {
				on         : function (eventName, callback)
				{
					if (events[eventName] === undefined)
						events[eventName] = [];

					events[eventName].push(callback);

					return this;
				},
				off        : function (eventName)
				{
					events[eventName] = [];

					return this;
				},
				trigger    : function (eventName, data)
				{
					if (events[eventName] !== undefined)
						require(['jquery'], function ($)
						{
							$.each(events[eventName], function (i, callback)
							{
								callback.apply(provider, [{name: eventName}, data]);
							});
						});

					return this;
				},
				getProvider: function ()
				{
					return provider;
				},
				setCompanyId: function(id)
				{
					companyId = id;
				}
			};

		function Provider(config)
		{
			this.config = config;
			this.interval = 0;
			this.user = {};
		}

		Provider.prototype.start = function ()
		{
			this.init();
			this.socketInit();
			this.setInterval();
			this.getUserData();
		};

		Provider.prototype.send = function (data)
		{
			if (data.echo !== undefined)
			{
				data.echo.clientid = this.user.clientid;
				data.echo.companyid = companyId;
				data.echo = JSON.stringify(data.echo);
			}
			else if (typeof data == 'object')
			{
				data.clientid = this.user.clientid;
				data.companyid = companyId;
			}

			this.socket.send(JSON.stringify(data));
		};

		Provider.prototype.init = function ()
		{
			this.coordinates = new Coordinates();
			this.socket = new WebSocket(this.config.url);
			this.utm = new Utm();
			this.userModel = new User();
		};

		Provider.prototype.socketInit = function ()
		{
			var p = this;
			this.socket.onmessage = function (event)
			{
				try
				{
					var response = JSON.parse(event.data);
				} catch (e)
				{
					if (console && console.log)
						console.log('Data parsing error: ', event.data);

					response = {};
				}

				if (typeof response.clientid != "undefined" && response.clientid != 0)
				{
					p.userModel.set(response.clientid, p);

					require(['jquery'], function ($)
					{
						$.each(response, function (key, data)
						{
							if (key == 'clientid')
								return;

							eventsHandler.trigger(key, data);
						})
					});
				}
			};
		};

		Provider.prototype.getUserData = function (e)
		{
			var pgwBrowser = $.pgwBrowser(),
				p = this;
			var userInfo = function (data)
			{
				p.user.ip = data.ip;
				p.user.browser = pgwBrowser.browser.name;
				p.user.browser_version = pgwBrowser.browser.fullVersion;
				p.user.viewport = pgwBrowser.viewport;
				p.user.platform = pgwBrowser.os.name;
				p.user.language = p.getLanguage();
				p.user.referrer = document.referrer;
				p.user.href = window.location.origin + window.location.pathname;
				p.user.utm = p.utm.parse();
				p.user.cookies_enabled = Cookies.enabled;
				p.user.clientid = +p.userModel.get();
				if (p.user.clientid == null)
					p.user.clientid = undefined;
				p.startSendData();
			};
			this.user.coordinates = [
				this.coordinates.getX(e),
				this.coordinates.getY(e),
				screen.width,
				screen.height,
				this.coordinates.getClientWidth(),
				this.coordinates.getClientHeight()
			];
			this.user.order_id = this.userModel.getOrderId();
			if (!(this.geo instanceof Geo))
				this.geo = new Geo(userInfo);
			return this.user;
		};

		Provider.prototype.setInterval = function ()
		{
			var p = this;
			setInterval(function ()
			{
				p.clearInterval.call(p);
			}, this.config.time);
		};

		Provider.prototype.clearInterval = function ()
		{
			this.interval = 0;
		};

		Provider.prototype.isNextSend = function (e)
		{
			var send = false;
			if ((this.coordinates.getPath(e) > this.config.distance) && this.interval === 0)
			{
				send = true;
				this.interval = 1;
			}
			return send;
		};

		Provider.prototype.getLanguage = function ()
		{
			if (navigator)
			{
				var language = false;
				if (navigator.language)
					language = navigator.language;
				else if (navigator.browserLanguage)
					language = navigator.browserLanguage;
				else if (navigator.systemLanguage)
					language = navigator.systemLanguage;
				else if (navigator.userLanguage)
					language = navigator.userLanguage;
				return language;
			}
		};

		Provider.prototype.startSendData = function ()
		{
			var p = this;
			document.onmousemove = function (e)
			{
				if (!e)
					e = window.event;
				var user = p.getUserData(e);
				if (p.isNextSend(e))
				{
					user.companyid = 1; // TODO Добавить в настройки
					p.send(user);
				}
			};
		};

		function Coordinates()
		{
			this.setCenter();
		}

		Coordinates.prototype.setCenter = function ()
		{
			this.last_x = this.getClientWidth() / 2;
			this.last_y = this.getClientHeight() / 2;
		};

		Coordinates.prototype.getClientWidth = function ()
		{
			return document.documentElement.clientWidth;
		};

		Coordinates.prototype.getClientHeight = function ()
		{
			return document.documentElement.clientHeight;
		};

		Coordinates.prototype.getPosition = function (e)
		{
			return {
				x: this.getX(e),
				y: this.getY(e)
			};
		};

		Coordinates.prototype.updatePosition = function (x, y)
		{
			this.last_x = x;
			this.last_y = y;
		};

		Coordinates.prototype.getPath = function (e)
		{
			var position = this.getPosition(e);
			var path = Math.sqrt(Math.pow(this.last_x - position.x, 2) + Math.pow(this.last_y - position.y, 2));
			this.updatePosition(position.x, position.y);
			return path;
		};

		Coordinates.prototype.getX = function (e)
		{
			if (typeof e == 'undefined')
			{
				return 0;
			} else if (e.pageX)
			{
				return e.pageX;
			} else if (e.clientX)
			{
				return e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
			}
			return 0;
		};

		Coordinates.prototype.getY = function (e)
		{
			if (typeof e == 'undefined')
			{
				return 0;
			} else if (e.pageY)
			{
				return e.pageY;
			} else if (e.clientY)
			{
				return e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
			}
			return 0;
		};

		function Geo(loadFunction)
		{
			this.url = '/ip.php';
			this.load(loadFunction)
		}

		Geo.prototype.load = function (loadFunction)
		{
			$.get(this.url, loadFunction, 'json');
		};

		function User()
		{
			this.name = 'solonkov';
			this.order_name = 'order_id';
		}

		User.prototype.set = function (id, p)
		{
			if (!this.get())
				Cookies.set(this.name, id);
			p.user.clientid = id;
		};

		User.prototype.get = function ()
		{
			return Cookies.get(this.name);
		};

		User.prototype.getOrderId = function ()
		{
			return Cookies.get(this.order_name);
		};

		function Utm()
		{
			this.utm_keys = [
				'utm_campaign',
				'utm_content',
				'utm_medium',
				'utm_source'
			];
		}

		Utm.prototype.parse = function ()
		{
			var url = decodeURI(document.location.search);
			if (url.indexOf('?') >= 0)
			{
				url = url.split('?');
				url = url[1];
				var result = {},
					params = [],
					key = [];
				if (url.indexOf('#') != -1)
					url = url.substr(0, url.indexOf('#'));
				if (url.indexOf('&') > -1)
					params = url.split('&');
				else
					params[0] = url;
				for (var r = 0; r < params.length; r++)
				{
					for (var z = 0; z < this.utm_keys.length; z++)
					{
						if (params[r].indexOf(this.utm_keys[z] + '=') > -1)
						{
							key = params[r].split('=');
							result[key[0]] = key[1];
						}
					}
				}
				if (!jQuery.isEmptyObject(result))
					return result;
			}
		};

		provider = new Provider({
			url     : 'ws://188.166.16.123:34250/',
			time    : 200,
			distance: 15
		});

		provider.start();

		return eventsHandler;
	}
);