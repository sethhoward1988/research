var ext = {
	citiesUrl: 'http://554838a8.services.gismeteo.ru/inform-service/87963fc3c2447108a296270d050d951c/cities/',
	forecastUrl: 'http://554838a8.services.gismeteo.ru/inform-service/87963fc3c2447108a296270d050d951c/forecast/',
	districtUrl: 'http://554838a8.services.gismeteo.ru/inform-service/87963fc3c2447108a296270d050d951c/districts/',	
	newsUrl: 'http://www.gismeteo.ru/news/rss/gis/',
	params: null,
	dict: null,
	delay: null,
	cities: null,
	news: null,
	ids: null,
	updatetime: 60000*15,
	utc: {timer: null, delay: 30000, time: null},
	iconPath: '../images/icons/mini/',
	isOpera:  null,
	isChrome: null, 
	init: function(callback) {	
		this.isOpera = (typeof opera != 'undefined')?true:false;
		this.isChrome =  !this.isOpera;
		if (this.isOpera) {
			this.citiesUrl = 'http://a956e985.services.gismeteo.ru/inform-service/588c42b53455e4d92511627521555fe4/cities/';
			this.forecastUrl = 'http://a956e985.services.gismeteo.ru/inform-service/588c42b53455e4d92511627521555fe4/forecast/';
			this.districtUrl = 'http://a956e985.services.gismeteo.ru/inform-service/588c42b53455e4d92511627521555fe4/districts/';				
		}
		this.params = this.getStorage('params') || this.getDefaultSettings();
		if (this.params.updatetime < this.updatetime) this.params.updatetime = this.updatetime; //important!!!	
		this.dict = this.setDictFromLang(this.params.lang);	
		this.ids = this.getStorage('ids') || {};		
		this.cities = this.getStorage('cities') ||  this.getDefaultCities() || {};
		this.news = this.getStorage('news') || {};		
		if(this.params.currCity && typeof this.cities[this.params.currCity] != 'undefined' && callback)
			callback();
		else this.setDefaultCity(callback);		
	},
	setDictFromLang: function(lang) {
		return dict[lang] || dict['ru'];
	},	
	render: function(callback) {	
		ext.getFrc(function() {
			if (callback) callback();
			ext.setIconOnPanel(ext.iconPath+ext.getIcon());
			ext.setBageOnPanel();
			var currCity = ext.params.currCity; 
			ext.utc.time = ext.getUtcTime();			
			clearTimeout(ext.delay);
			ext.delay = null;
			ext.delay = setTimeout(function() {ext.init(function(){ ext.render()})}, ext.utc.delay);				
		});	
	},
	getFrc: function (callback, id) {
		var currCity = '4368';
		if (id) currCity = id
		else currCity = (!this.params.currCity || typeof this.params.currCity == 'undefined')?'4368':this.params.currCity ;
		if (typeof this.cities[currCity] == 'undefined') typeof this.cities[currCity] = {}; 
		var date = 0; 
		if(typeof this.cities[currCity].cur_time != 'undefined')
			date = (!isNaN(new Date(this.cities[currCity].cur_time)) ? new Date(this.cities[currCity].cur_time) : new Date(this.cities[currCity].cur_time.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1').replace("T"," ").replace("Z","").replace(/(\d+):(\d+):(\d+).(\d+)/, '$1:$2')));
		if (
				typeof this.cities[currCity].fact == 'undefined' ||
				typeof this.cities[currCity].forecast == 'undefined' ||
				typeof this.cities[currCity].cur_time == 'undefined' ||
				this.cities[currCity].cur_time == 0 ||
				new Date().getTime()-date.getTime() < 0 ||
				this.params.updatetime <= new Date().getTime()-date.getTime()
		){
			this.setIconOnPanel('../favicon-16.png');
			this.setBageOnPanel('Gismeteo');								
			$.ajax({
				type: "GET",
				url: this.forecastUrl,
				data: {city: currCity, all_langs: 1, ver: '2_3_3'},
				dataType: "xml",
				success: $.proxy(function(data, status, xhr) {
					var f = $(data).find('location');
					try {
						this.cities[currCity].fact = this.parseData($(f[0]), 'fact');
						this.cities[currCity].forecast = this.parseData($(f[0]), 'forecast');
						this.cities[currCity].cur_time = new Date();
						this.cities[currCity].tzone = f.attr('tzone')*60000;
						this.cities[currCity].name = {};
						$.each(langs, $.proxy(function(index) {
							this.cities[currCity].name[langs[index]] = f.attr('name_'+langs[index]);				
						}, this));
						this.setStorage('cities', this.cities);
						this.setStorage('ids', this.ids);	
					}
					catch(e) {}												
					if (callback) callback();
				}, this),
				error: function () {
					clearTimeout(ext.delay);
					ext.delay = null;					 
					ext.delay = setTimeout(function(){ext.init(ext.render)}, 10000);
				}
			});
		}
		else if (callback) {
			callback();
		}
	},	
	
	getStorage: function (key) {
		var value = localStorage.getItem(key);
		try {
			if (value) return $.evalJSON(value);
			else return null;
		}
		catch (err) {return null}
	},
	setStorage: function(key, val) {
  	if(typeof widget != 'undefined' && widget.preferences)
  		localStorage = widget.preferences;
		localStorage.removeItem(key);
  	localStorage.setItem(key, $.toJSON(val));
	},
	getDefaultSettings: function() {
		var params = {};
		$.extend(params, this.params);
		if (this.isChrome) params.lang = localStorage.getItem('GismeteoLang') || chrome.i18n.getMessage("lang") || 'ru';
		else params.lang = localStorage.getItem('GismeteoLang') || defLang || 'ru';
		params.deg = localStorage.getItem('GismeteoTemper') || 'C';
		params.press = localStorage.getItem('GismeteoPress') || 'mmHg';
		params.wind = localStorage.getItem('GismeteoWind') || 'm';
		params.fullfrc = localStorage.getItem('GismeteoFullFrc') || 'on';	
		params.iconsOnPanel	= localStorage.getItem('GismeteoIconsOnPanel') || 'fact';
		params.iconsType = localStorage.getItem('GismeteoIconsType') || 'icontype1';
		params.news = localStorage.getItem('GismeteoNews') || 'on'; 
		params.colorSheme = localStorage.getItem('GismeteoSheme') || 'bright'; 
		params.currCity = localStorage.getItem('cid') || '4368';
		params.updatetime = localStorage.getItem('GismeteoTimeOut') || this.updatetime;  	
		return params;
	},
	getDefaultCities: function() {
		var arr = localStorage.getItem('GismeteoCitiesList');
		if (!arr) return null;
		arr = arr.split(',');
		var cities = {};
		var i = 0;
		$.each(arr, $.proxy(function(index) {
			var city = arr[index].split('_');
			if (city.length>1) {
				var id = city[0];
				cities[id] = {};
				cities[id].id = id;
				cities[id].name = {};
				cities[id].name[this.params.lang] = city[1];
				this.ids['city'+i] = id;	
				i++;
			}	
		}, this));
		return cities; 		
	},	
	setDefaultCity: function(callback) {
		this.params.currCity = '4368';
		this.cities[this.params.currCity+''] = {};
		this.cities[this.params.currCity+''].id = this.params.currCity;		
		data = {mode: 'ip', nocache: '1'};
		$.ajax({
			type: "GET",
			url: this.citiesUrl,
			data: data,
			dataType: "xml",
			success: $.proxy(function(data, status, xhr) {
				var f = $(data).find('item');
				if (f.length>0) {
					var id = $(f[0]).attr('id');
					this.cities[id] = {};
					this.cities[id].id = $(f[0]).attr('id');
					this.cities[id].name = $(f[0]).attr('n');				
					this.params.currCity = this.cities[id].id;
					this.ids.city0 = $(f[0]).attr('id');									 
				}
				else {
					var id = this.dict.default_city_id;
					this.cities[id] = {};
					this.cities[id].id = id;
					this.cities[id].name = this.dict.default_city_name;			
					this.params.currCity = id;
					this.ids.city0 = id;				
				}
			}, this),
			error: $.proxy(function() {
				var id = this.dict.default_city_id;
				this.cities[id] = {};
				this.cities[id].id = id;
				this.cities[id].name = this.dict.default_city_name;			
				this.params.currCity = id;
				this.ids.city0 = id;										
			}, this),
			complete: $.proxy(function() {
				this.setStorage('cities', this.cities);
				this.setStorage('ids', this.ids);
				this.setStorage('params', this.params);
				if (callback) callback();					
			}, this)							
		});			
	},
	parseData: function(data, item) {
		var d = [];
		$(data).find(item).each($.proxy(function(index, obj){
			var f=$(obj).find('values');
			this.data = {
				tod: $(obj).attr('tod'),
			  valid: $(obj).attr('valid'),
				t:f.attr('t'),
				t_feels:f.attr('hi'),																								
				hi:f.attr('hi'),
				p:f.attr('p'),
				cl:f.attr('cl'),
				pt:f.attr('pt'),
				pr:f.attr('pr'),
				st:f.attr('ts'),				
				wd:f.attr('wd') == 0?1:f.attr('wd'),
				ws:f.attr('ws'),
				hum:f.attr('hum'),
				icon:f.attr('icon').indexOf('sun')>-1?'d':'n',
			};
			d.push(this.data);
		}, this));
		return d;
	},
	getIcon: function() {
		var icon = null;
		var city = this.cities[this.params.currCity];
		try {
			var data = (this.params.iconsOnPanel == 'fact'?city.fact[0]:city.forecast[0]);
			var obj = this.getImage(data);
			icon = obj.tod + obj.cl + obj.pt + obj.st + '.png';
		}
		catch(err) {icon = 'logo.png';}
		return icon;
	},
	getImage: function(data) {
		if (data.st == 1 && data.cl == 0) data.cl=1;
		var cl = data.cl, pt = data.pt, pr = data.pr, st = data.st, tod = 'n', icon = data.icon;
		tod = icon;
		if (cl == "") cl = 0;
		if (cl == 0) {pt = 0; pr = 0}
		if (pr == 3) pr = 2;
		if (pt == 0) pr = 0;
		if (pt == 0) pt = '';
		if (pr == 0 ) pr = '';
		if (pt == 0 && st != 0) pt = '0';
		if (pr == 0 && st != 0) pr = '0';
		if (st == 0) st = '';
		return {tod: tod, cl: cl, pt: pt, pr: pr, st: st};		
	},	
	setIconOnPanel: function(imgPath) {
		var canvas = document.getElementById('icon');	
		var ctx = canvas.getContext('2d');
	  var img = new Image();
	  var obj = this;
		img.onload = function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, img.width, img.height);
			var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  		if (obj.isOpera)  toolbarBtn.icon = imgPath;
 			if (obj.isChrome) chrome.browserAction.setIcon({'imageData': imgData});
			delete imgData;
		}
	  img.src = imgPath;		
	},
	setBageOnPanel: function(title) {	
		// var text = '';	
		// if (this.isOpera) var color = 'rgba(255, 0, 0, 255)'; 	
		// else var color = {color: [255, 0, 0, 255]};
		// if (typeof title == 'undefined') {
		// 	try {
		// 		var city = this.cities[this.params.currCity];
		// 		var data = (this.params.iconsOnPanel==='fact'?city.fact[0]:city.forecast[0]);
		// 		var t = data.t;	
		// 		if (t<0) color = {color: [78, 168, 234, 255]};
		// 		if (this.isOpera) {
		// 			if (t<0) color ='rgba(78, 168, 234, 255)';			
		// 		}
		// 	  var t = this.params.deg == 'C'?data.t:Math.round(data.t*1.8+32);
		// 		title = city.name[this.params.lang]+': '+(t>=0?(t!=0?'+':''):'–')+Math.abs(t)+' '+
		// 																ext.dict.phenomens['cl'+data.cl]+
		// 																((data.pr != 0 && data.pr != 2)||(data.pt==1 || data.pt==2)?', ':'')+
		// 																(data.pr != 0 && data.pr != 2?ext.dict.phenomens['pr'+data.pr]:'')+
		// 																(data.pt==1 || data.pt==2?' '+ext.dict.phenomens['pt'+data.pt]:'')+
		// 																(data.ts==1?', '+ext.dict.phenomens['ts1']:'');	
		// 		text = ''+(t>=0?(t!=0?'+':''):'–')+Math.abs(t);	
		// 	}
		// 	catch(err) {text = ''; title = 'Gismeteo'}																	  
		// }
		 																				
	 //  if (this.isOpera) {
	 //  	try {
	 // 			toolbarBtn.badge.backgroundColor = color;
		// 		toolbarBtn.badge.textContent = text;
		// 		toolbarBtn.title = title;
		// 	}
		// 	catch(err) {opera.postError(err);}
	 //  }
		// if (this.isChrome) {
		// 	chrome.browserAction.setBadgeBackgroundColor(color);
		// 	chrome.browserAction.setBadgeText({text: text});
		// 	chrome.browserAction.setTitle({'title':  title});
		// }
	},
	getUtcTime: function(){
		var now = new Date();
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		return now_utc.getTime(); 
  },
  getNews: function(callback) {
  	if (typeof this.news.cur_time == 'undefined' || this.news.cur_time == 0 || this.params.updatetime <= new Date().getTime()-new Date(this.news.cur_time).getTime()) {
			$.ajax({
		    type: "GET",
		    cache: false,
		  	url: this.newsUrl,
		    dataType: "xml",
		    success:  $.proxy(function(data, status, xhr) {
		    	var f = $(data).find('item');	
		    	$.each(f, $.proxy(function(index) {
		    		this.news['n'+index] = {};
		    		this.news['n'+index].title = $(f[index]).find('title')[0].textContent;
		    		this.news['n'+index].link = $(f[index]).find('link')[0].textContent;
		    		this.news['n'+index].description = $(f[index]).find('description')[0].textContent.replace(/<\/?[^>]+>/g, '');	
		    		this.news['n'+index].img = $(f[index]).find('description')[0].textContent.match(/<\/?[^>]+>/g);	
		    		this.news.cur_time = new Date();   			    		
		    	}, this));
		    	this.setStorage('news', this.news);	
		    	if (callback) callback();
		    }, this),
		    error: function() { 
		    	setTimeout(function(){ext.getNews()}, 10000);
		    }
		  });
		}
		else 
			if (callback) callback();
  }			 
}

if (typeof opera != 'undefined') {
	var opera_properties = {
		disabled: false,
		icon: './favicon-16.png',
		badge: {
			display: 'true',
			color: "white"
		},
		popup: {
			href: "popup.html",
			width: 480,
			height: 290
		}			
	}
	var toolbarBtn = opera.contexts.toolbar.createItem(opera_properties);
	opera.contexts.toolbar.addItem(toolbarBtn);
}

window.addEventListener('load', function(){
	ext.init(function(){ ext.render()}); ext.getNews()}, 
	false
);

function openTab(value) {
	opera.extension.tabs.create({url: value, focused: true});
}

var _gaq = _gaq || [];
var isOpera = (typeof(opera) != 'undefined')?true:false;
var isChrome =  !isOpera;
var code = isChrome?'UA-39250399-1':'UA-37196636-1';
_gaq.push(['_setAccount', code]);
_gaq.push(['_trackPageview']);
		
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// End Gismeteo Stuff