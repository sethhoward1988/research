	var background = ((typeof chrome != 'undefined')?chrome.extension.getBackgroundPage():opera.extension.bgProcess);
	var templates = {
		tpls: {forecast: null, news: null},
		loadTpl: function(template, data) {
    	return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
      	var keys = key.split("."), value = data[keys.shift()];
        $.each(keys, function () { value = value[this]; });
        return (value === null || value === undefined) ? "" : ($.isArray(value) ? value.join('') : value);
      });
    },
    data: {},
    init: function(callback) {
    	this.tpls.forecast = $('.weather-block-cnt').html();
    	this.tpls.forecast_block = $('.forecast_content').html();
    	this.tpls.news_block = $('.news_content').html(); 
    	this.tpls.forecast_foot_menu = $('.forecast_foot_menu').html(); 
    	this.tpls.news_foot_menu = $('.news_foot_menu').html();
    	if (callback) callback();
    } 			
	};
	
	var ext = {
		params: null,
		templates: templates,
		cities: null,
		news: null,
		dict:  null,
		ids: null,
		utc: null,
		init: function() {
			ext.templates = templates;
			ext.params = background.ext.params;
			ext.cities = background.ext.cities;
			ext.news = background.ext.news;
			ext.dict = background.ext.dict || background.ext.setDictFromLang(ext.params.lang);
			ext.ids = background.ext.ids;
			ext.utc = background.ext.utc;
			ext.render();
		},
		delay: 30*1000,
		timeout: null,
		render: function() {
			this.templates.data.colorSheme = this.getColorSheme();
			this.templates.data.preloader_color = (this.params.colorSheme == 'dark'?'dark':'bright');
			this.templates.data.preloader_top = Math.round($('.weather-block-cnt').height()/2-30)+'px'
			var currCity = this.params.currCity;
			if (this.params.lang != 'ru' || this.params.news != 'on') {
			  this.templates.data['today_show'] = 'block';				
				this.templates.data['forecast_show'] = 'block';
				this.templates.data['news_show'] = 'none';				
			}				
			$("#selectCity").html('');				
			$.each(this.ids, $.proxy(function(index, val) {
				try {
					var city = typeof this.cities[val].name[this.params.lang] != 'undefined'?this.cities[val].name[this.params.lang]:typeof this.cities[val].name['en'] != 'undefined'?this.cities[val].name['en']:this.cities[val].name;
					this.templates.data[index] = '<li'+(val == this.params.currCity && this.templates.data['news_show']!='block'?' class="active"':'')+'><a href="#'+val+'">'+city+'</a></li>';				
					$("#selectCity").append($('<option value="'+val+'">'+city+'</option>'));
				}
				catch(e) {console.log(e)}				
			}, this));
			if (this.params.news == 'on' && this.params.lang == 'ru') this.templates.data['news_a'] = '<li'+(this.templates.data['news_show']&&this.templates.data['news_show']=='block'?' class="active"':'')+'><a href="#news">Новости</a></li>';
			else {
				this.templates.data['news_a'] = '';
			}
			var delay = 1000;
			if (
				!this.cities[currCity] ||
				typeof this.cities[currCity] == 'undefined' ||
				typeof this.cities[currCity].name == 'undefined' ||
				typeof this.cities[currCity].cur_time == 'undefined' ||
				this.cities[currCity].cur_time == 0
			) {	
				delay = 10000;
			}
			else {
				delay = this.delay;
				this.templates.data['today_show'] = this.templates.data['today_show'] || 'block';				
				this.templates.data['forecast_show'] = this.templates.data['forecast_show'] || 'block';
				this.templates.data['news_show'] = this.templates.data['news_show'] || 'none';			

				this.templates.data.timeAfter = (this.templates.data['news_show'] == 'none'?ext.getTimeAfter(this.cities[currCity].cur_time):ext.getTimeAfter(this.news.cur_time));	
				$.extend(this.templates.data, this.getCurrentDatetime(this.cities[currCity].tzone));
				this.templates.data.currentDateTime = this.dict.weekdays['w'+this.templates.data.day]+', '+this.templates.data.date+' '+this.dict.monthes['m'+this.templates.data.month]+', '+this.templates.data.hour+':'+this.templates.data.minutes;
				$.extend(this.templates.data, this.setTemplateDate(this.cities[currCity].fact[0], 'fact'));	
						
				this.templates.data['now'] = this.dict.fieldset_legend.now;	
				this.templates.data['tomorrow'] = this.dict.fieldset_legend.tomorrow;
				this.templates.data['display_props'] = 'display: none';
				if (this.params.fullfrc == 'on') this.templates.data['display_props'] = 'display: block';	
				this.templates.data['visibility_today'] = 'hiddenBlock';
				this.templates.data['visibility_tomorrow'] = 'hiddenBlock';	
				this.clearForecast();
				$.each(this.cities[currCity].forecast, $.proxy(function(key, val) {
					$.extend(this.templates.data, this.setTemplateDate(val, 'forecast'));
					this.templates.data['color'] = this.getBackgroundColor(val);
					if (key==3) this.templates.data['last'] = 'info-last';
					if (this.isToday(val, this.cities[currCity].tzone).istoday) {
						this.templates.data['visibility_today'] = 'visibleBlock';
						if (key==3 && this.templates.data['visibility_tomorrow'] == 'hiddenBlock') this.templates.data['last'] = this.templates.data['last']+' info-last_4';						
						this.templates.data['now'+key] = this.templates.loadTpl(this.templates.tpls.forecast_block, this.templates.data);
					}
					else {
						var record = this.isToday(val, this.cities[currCity].tzone);
						if (key<3) this.templates.data['tomorrow'] = this.dict.fieldset_legend.tomorrow + ' ' +this.dict.weekdays['w'+record.day].toLowerCase()+', '+record.date+' '+this.dict.monthes['m'+record.month];
						this.templates.data['visibility_tomorrow'] = 'visibleBlock';
						if (key==3 && this.templates.data['visibility_today'] == 'hiddenBlock') this.templates.data['last'] = this.templates.data['last']+' info-last_4';
						this.templates.data['tomorrow'+key] = this.templates.loadTpl(this.templates.tpls.forecast_block, this.templates.data);
					}	
				}, this));		
				this.templates.data['id'] = currCity;
				this.templates.data['mainurl'] = 'http://www.gismeteo.'+this.dict.domain;
				this.templates.data['from'] = (background.ext.isOpera?'opera':'chrome');				
				this.templates.data['busy'] = this.dict.links.busy;
				this.templates.data['d3'] = this.dict.links.d3;
				this.templates.data['d7'] = this.dict.links.d7;
				this.templates.data['w2'] = this.dict.links.w2;
				if (this.templates.data['news_show'] == 'block')  this.templates.data['foot_menu'] = this.templates.loadTpl(this.templates.tpls.news_foot_menu, this.templates.data);
				else this.templates.data['foot_menu'] = this.templates.loadTpl(this.templates.tpls.forecast_foot_menu, this.templates.data);
				this.renderLoader(false);																																								
			}	
			$.each(this.news, $.proxy(function(key, val) {
				this.templates.data['news_title'] = val.title;
				this.templates.data['news_link'] = val.link;
				this.templates.data['news_descript'] = val.description;	
				this.templates.data['news_img'] = val.img;							
				this.templates.data[key] = this.templates.loadTpl(this.templates.tpls.news_block, this.templates.data);
			},this));
			
			this.templates.data['weather_forecast'] = this.dict.title2; 
	
			var content = this.templates.loadTpl(this.templates.tpls.forecast, this.templates.data);
			$('.weather-block-cnt').html('');
			$('.weather-block-cnt').append(content);
			var maxHeight = 0;
			if (this.templates.data['news_show'] != 'block') {
				$('.forecast .conditions').each(function() {
					if ( maxHeight<=$(this).height()) maxHeight = $(this).height();
				});	
				$('.forecast .conditions').css({'height': maxHeight+'px'});
			}
			if (background.ext.isOpera) background.toolbarBtn.popup.height = $('.weather-block-cnt').height();
					
			clearTimeout(this.timeout);
			this.timeout = null;
			this.timeout = setTimeout(ext.init, delay);
			
			$('.weather-block a.close').unbind('click').bind('click', function(event) {
				event.preventDefault();
				window.close();
			});	
			
			$('.weather-block a.options').unbind('click').bind('click', function(event) {
				event.preventDefault();
				$('.weather-block a.close').trigger('click');
				if (background.ext.isChrome)
					chrome.tabs.create({'url':'options.html', 'selected':true});
				else background.openTab('options.html');
			});	
			
			$('.weather-block .menu a').unbind('click').bind('click', function(event) {
				event.preventDefault();
				$('.weather-block .menu a').parent().removeClass('active');
				$(this).parent().addClass('active');
				var id = $(this).attr('href').replace('#', '');
				ext.templates.data = {};
				if (id == 'news') {
					ext.templates.data['news_show'] = 'block';
					ext.templates.data['today_show'] = 'none';
					ext.templates.data['forecast_show'] = 'none';																			
					background.ext.getNews(ext.init);
				}
				else {
					ext.renderLoader(true);
					ext.templates.data['news_show'] = 'none';
					ext.templates.data['today_show'] = 'block';
					ext.templates.data['forecast_show'] = 'block';
					background.ext.params.currCity = id;
					background.ext.setStorage('params', background.ext.params);
					background.ext.render(ext.init);							
				}
			});
			
			$('.weather-block a.refresh').unbind('click').bind('click', function(event){
				event.preventDefault();
				ext.renderLoader(true);				
				if (ext.templates.data['news_show'] == 'none') {
					var currCity = ext.params.currCity;
					ext.cities[currCity].cur_time = 0;
					background.ext.setStorage('cities', ext.cities);
					background.ext.init(function(){ background.ext.render(ext.init)});
				}
				else {
					background.ext.news.cur_time = 0;
					background.ext.getNews(ext.init);						
				}								 
			});	
			
			$('.weather-block .foot a').unbind('click').bind('click', function(event){
				event.preventDefault();
				if (background.ext.isChrome)
					chrome.tabs.create({url: $(this).attr('data')});	
				else background.openTab($(this).attr('data'));	
			});
			
			$('.news .contents a').unbind('click').bind('click', function(event){
				event.preventDefault();
				if (background.ext.isChrome)
					chrome.tabs.create({url: $(this).attr('data')});	
				else background.openTab($(this).attr('data'));	
			});										
		},
		clearForecast: function() {
			try {
				for (var i=0; i<4; i++) {
					this.templates.data['now'+i] = '';
					this.templates.data['tomorrow'+i] = '';				
				}
			}
			catch(err) {}
		},
		getColorSheme: function() {
			var className = null;
		  switch (this.params.colorSheme) {
		  	case 'dark': 
		  	className = "weather-block-dark";
		  	break;
		  	case 'bright':
		  	className = "backgroundImg";
		  	break;  	
		  	default: 
		  	className = "";
		  	break;  		  	  	
		  }			
			return className;	
		},
		getTimeAfter: function(value) {
			var gap = (new Date().getTime()-new Date(value).getTime());		
			var str = '';		
			if (gap>=60000*60*24) str = this.dict.gap_time.more+' 1 '+this.dict.gap_time.day;			
			if (gap<60000*60*24) str = Math.round(gap/60000*60)+' '+this.dict.gap_time.hour;
			if (gap<60000*60) str = Math.round(gap/60000)+' '+this.dict.gap_time.minute;	
			if (gap<60000*2) str = this.dict.gap_time.minute_p;
			if (gap<60000) str = this.dict.gap_time.now;																			
			if (gap>=60000) str +='<br />'+this.dict.gap_time.keep_off;
			return str;		
		},
		getCurrentDatetime: function(value) {
			var record = {};
			var now = new Date();
			now.setTime(this.utc.time + value);
			record.day = now.getDay();
			record.date = now.getDate();
			record.month = now.getMonth();
			record.hour = now.getHours();			
			record.minutes = now.getMinutes();
			if (record.minutes.toString().length == 1) record.minutes = '0' + record.minutes;
			return record;	
		},
		setTemplateDate: function(data, ident) {
			var record = {}
			ident = '_' + ident;
			record['t'+ident] = ext.params.deg == 'C'?data.t:Math.round(data.t*1.8+32);
			record['plus'+ident] = record['t'+ident]>=0?(record['t'+ident]!=0?'+':''):'&minus;';
			record['t'+ident] = Math.abs(record['t'+ident]);
			record['t_feels'+ident] = ext.params.deg == 'C'?data.t_feels:Math.round(data.t_feels*1.8+32);
			record['plus_feels'+ident] = record['t_feels'+ident]>=0?(record['t_feels'+ident]!=0?'+':''):'&minus;';
			record['t_feels'+ident] = Math.abs(record['t_feels'+ident]);
			record['feels'+ident] = ext.dict.feels;		
			record['sign'+ident] = ext.dict.params[ext.params.deg];
			record['pict'+ident] = ext.getImage(data);
			record['press'+ident] = ext.params.press=='mmHg'?data.p:Math.round(data.p/0.75);
			record['press_descript'+ident] = ext.dict.params[ext.params.press];
			record['ws'+ident] = data.ws>0?(ext.params.wind=='m'?data.ws:Math.round(data.ws*3.6)):ext.dict.wDirs[0];
			record['ws_descript'+ident] = data.ws>0?ext.dict.params[ext.params.wind]:'';
			record['wd_descript'+ident] = data.ws>0?', '+ext.dict.wDirs[data.wd]:'';
			record['wind_dir'+ident] = ((data.ws>0?data.wd:0) + (this.params.colorSheme == 'dark'?'-dark':''));
			record['hum'+ident] = data.hum;
			record['hum_descript'+ident] = ext.dict.hum;
			record['description'+ident] = ext.dict.phenomens['cl'+data.cl]+
																	((data.pr != 0 && data.pr != 2)||(data.pt==1 || data.pt==2)?', ':'')+
																	(data.pr != 0 && data.pr != 2?ext.dict.phenomens['pr'+data.pr]:'')+
																	(data.pt==1 || data.pt==2?' '+ext.dict.phenomens['pt'+data.pt]:'')+
																	(data.st==1?', '+ext.dict.phenomens['ts1']:'');
			record['imgtype'] = ext.params.iconsType == 'icontype1'?'clip_art':'photorealistic';
			record['cl'+ident] = 'c'+data.cl;
			record['pt'+ident] = (data.pt==1?'r':'s')+data.pt;
			record['st'+ident] = 'st'+data.st;
			record['last'] = '';			
			try {
				record['tod'+ident] = ext.dict.tods[data.tod];
				if (data.tod == '3') record['last'] = 'info-last'; 
			}
			catch(err) {}
			return record; 
		},
		getBackgroundColor: function (data) {
			if (this.params.colorSheme != 'color') return 'none';	
			var color = null;
		  if (data.tod == 0) color = "e2e7ec";
		  if (data.tod == 1) color = "d8ecfd"; 	
		  if (data.tod == 2) color = "ffecc1";  	
		  if (data.tod == 3) color = "efdfff";   		  	  	
			return '#'+color;		
		},
		getImage: function(data) {
			var cl = (data.st == 1 && data.cl == 0?1:data.cl);
			var pt = data.pt;
			var pr = data.pr;
			var st = data.st;
			var tod = 'n';
			var icon = data.icon;
			tod = icon;
			if (cl == "") cl = 0;
			if (cl == 0) {pt = 0; pr = 0;}
			if (cl == 3 && ext.params.iconsType != 'icontype1') tod = '';
			if (pr == 3) pr = 2;
			if (pt == 0) pr = 0;
			if (pt == 0) pt = '';
			if (pr == 0 ) pr = '';
			if (pt == 0 && st != 0) pt = '0';
			if (pr == 0 && st != 0) pr = '0';
			if (st == 0) st = '';
			if (ext.params.iconsType == 'icontype1') return tod+cl+pt+st;
			else return tod+cl+pt+pr+st;
		},
		isToday:function(val, tzone)	{ 
      var str  = val.valid.replace("T"," ").split(" ");
      var time = (str[1].match(/\d+:\d+/).toString()).replace(/^0/,'');
      var date = new Date(val.valid.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1').replace("T"," "));
			var record = {};
			record.day = date.getDay();
			record.date = date.getDate();
			record.month = date.getMonth();	
			var now = this.getCurrentDatetime(tzone);
			if (record.date == now.date && record.month == now.month) record.istoday = true;
			else record.istoday = false;
			return record;
		},
	 	renderLoader: function(isLoader) {
			$('.preloader').css({'top': Math.round($('.weather-block').height()/2-30)+'px'});
			$('.preloader').removeClass('dark');
			if (this.params.colorSheme == 'dark') $('.preloader').addClass('dark');
	 		if (isLoader) $('.weather-block-cnt').addClass('hide');
	 		else $('.weather-block-cnt').removeClass('hide');		
		}
	};
	
	window.addEventListener('load', function(){
		templates.init(ext.init)}, 
		false
	);