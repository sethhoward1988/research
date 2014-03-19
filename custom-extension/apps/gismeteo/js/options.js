	var suggest = new GISCitySuggest();
	suggest.url = background.ext.citiesUrl;
	suggest.minLength = 2;
	suggest.result_tpl = "<div class=\"icon @kind\"></div><div class=\"city\">@city</div><div class=\"dc\">@district@country</div>";
	suggest.loadingClass = 'o';
	suggest.setCallback('select', $.proxy(function(event, ui){
		var data = $(ui.item).attr('item');		
		data = $(data);
		var city = {};
		city.id = data.attr('id');
		city.name = {};									 					
		$.each(langs, function(index) {								
			city.name[langs[index]] = data.attr('n_'+langs[index]);				
		});				
		$('input.info').val(city.name[options.dict.lang]);								
		$('input.info').attr('data', $.toJSON(city));				
		$('#addfromsearch').removeAttr('disabled').removeClass('add-disabled');
	}, this));	
	
	var options = {
		params: null,
		cities: null,
		dict:  null,
		ids: null,
		delays: new Array('15', '30', '60', '180', '360', '720', '1440'),	
		timeout: null,
		init:  function() {		
			options.params = background.ext.params || background.ext.getStorage('params');
			options.cities = background.ext.cities || background.ext.getStorage('cities');
			options.dict = background.ext.dict || background.ext.setDictFromLang(ext.params.lang);
			options.ids = background.ext.ids || background.ext.getStorage('ids');
			suggest.init($('input.info'), options.dict.lang);	
			options.render();
		},
		render: function() {
			this.staticTranslate();
			this.setMenu();
			this.setShemes();
			this.setFullFrc();	
			this.setIconsType();
			this.setIconsOnPanel();
			this.setTemperType();
			this.setWindType();
			this.setPressType();
			this.setNews();
			this.setReloadFrc();
			var obj = this;	
			this.setCountryList(options.params.lang);

			$('.menu-languages a').unbind('click').bind('click',function(event) {
				event.preventDefault();
				try {
					options.params.lang = $(this).attr('href').replace('#', '');				
					background.ext.params = options.params;
					background.ext.dict =  dict[options.params.lang] || dict['ru'];
					background.ext.setStorage('params', options.params);
					options.init();
					ext.init();
				}catch(err) { return; }
			});
			
			$('input[type=radio][name=shemes]').unbind('change').bind('change', function(){
				options.params.colorSheme =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();
			});
			
			$('input[type=radio][name=temper]').unbind('change').bind('change', function(){
				options.params.deg =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();					
			});	
			
			$('input[type=radio][name=wind]').unbind('change').bind('change', function(){
				options.params.wind =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();					
			});	
			
			$('input[type=radio][name=pressure]').unbind('change').bind('change', function(){
				options.params.press =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();					
			});	
			
			$('input[type=radio][name=icons]').unbind('change').bind('change', function(){
				options.params.iconsType =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();		
			});
			
			$('input[type=radio][name=icons-panel]').unbind('change').bind('change', function(){
				options.params.iconsOnPanel =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();		
			});	

			$('input[type=checkbox][name=news]').unbind('change').bind('change', function(){
				options.params.news =($(this).filter(":checked").val());	
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();			
			});
			
			$('input[type=checkbox][name=fullfrc]').unbind('change').bind('change', function(){		
				options.params.fullfrc =($(this).filter(":checked").val());
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				ext.init();			
			});	
			
			$('#reloadFrc').unbind('change').bind('change', function(event){
				var obj = event.currentTarget;
				value = $('#reloadFrc :selected').val();
				options.params.updatetime = value*60000;
				background.ext.params = options.params;
				background.ext.setStorage('params', options.params);
				background.ext.render(ext.init);			
			});
			
			$('input.info').unbind('keyup').bind('keyup', function(e) {
				if(e.which == 13) return;
				$('#addfromsearch').attr('disabled', 'disabled').addClass('add-disabled');
			});
			
			$('input.info').unbind('click').bind('click', function() {
				$(this).select();
			});	
			
			$('.x').unbind('click').bind('click', function() {
				if (!$(this).hasClass('o')) {
					$('input.info').val('');
					$('input.info').removeAttr('data');					
					$(this).hide();	
					$('#addfromsearch').attr('disabled', 'disabled').addClass('add-disabled');
				}
			});
			
			$('#addfromsearch').unbind('click').bind('click', $.proxy(function() {
				try {					
					var city = $.evalJSON($('input.info').attr('data'));
					this.addCity(city);	
					background.ext.ids = this.ids;
					background.ext.setStorage('ids', background.ext.ids);
					background.ext.cities = this.cities;
					background.ext.setStorage('cities', background.ext.cities);
					ext.init();	
				}
				catch(err) {alert(err);}
			}, this));
			
			$('#addfromselect').unbind('click').bind('click', $.proxy(function() {			
				try {
					var city = $.evalJSON($('#city option:selected').attr('data'));
					this.addCity(city);	
					background.ext.ids = this.ids;
					background.ext.setStorage('ids', background.ext.ids);
					background.ext.cities = this.cities;
					background.ext.setStorage('cities', background.ext.cities);				
					ext.init();	
				}
				catch(err) {alert(err);}							
			}, this));			
			
			$('.up').unbind('click').bind('click', $.proxy(function() {		
				this.up();
				this.updateCities();
				background.ext.ids = options.ids;
				background.ext.setStorage('ids', background.ext.ids);	
				ext.init();															
			}, this));
			
			$('.down').click($.proxy(function() {	
				this.down();
				this.updateCities();
				background.ext.ids = options.ids;
				background.ext.setStorage('ids', background.ext.ids);	
				ext.init();					
			}, this));
			
			$('.delete').unbind('click').bind('click', $.proxy(function() {	
				if ($('select[id=selectCity] option').size()==1) return;	
				else { 
					$('#selectCity :selected').remove();
					this.updateCities();
					background.ext.ids = this.ids;
					background.ext.setStorage('ids', background.ext.ids);
					if (!this.currCityInIds()) this.params.currCity = this.ids['city0'];
					background.ext.params = options.params;
					background.ext.setStorage('params', options.params);				
					ext.templates.data = {};
					background.ext.render(ext.init);				
				}
			}, this));
			
			$('#country').unbind('change').bind('change', $.proxy(function() {
				$('button#addfromselect').attr('disabled', 'disabled');
				this.setDistrictList($('#country :selected').val());			
			}, this));
			
			$('#district').unbind('change').bind('change', $.proxy(function() {
				$('button#addfromselect').attr('disabled', 'disabled');
				this.setCitiesList($('#district :selected').val(), true);			
			}, this));
			
			$('#selectCity').unbind('change').bind('change', function() {
				$('.cell-last button').removeAttr('disabled');	
			});	
																					
		},
		setMenu: function() {
			var html = '';
			for (var i=0; i<menus.length; i++)
				if (langs[i] == this.dict.lang) html+='<li class="active"><a>'+menus[i]+'</a></li>';
				else html+='<li class="'+langs[i]+'"><a href="#'+langs[i]+'">'+menus[i]+'</a></li>';
			$('.menu-languages').html(html);
		},
		setShemes: function() {
			var sheme = options.params.colorSheme;
			if (!sheme) sheme = "bright";
			switch(sheme) {
				case "colorful":
				case "blue":
				sheme = "bright";
				break;
				case "dark":
				sheme = "dark";
				break;						
			}
			$('input[type=radio][name=shemes][value='+sheme+']').attr('checked', 'checked');		
		},
		setFullFrc: function() {
			var value =  options.params.fullfrc;
			if (value == 'on') $('input[type=checkbox][name=fullfrc]').attr('checked', 'checked');	
		},	
		setIconsType: function() {
			var value	= options.params.iconsType;
			$('input[type=radio][name=icons][value='+value+']').attr('checked', 'checked');				
		},	
		setIconsOnPanel: function() {
			var value	= options.params.iconsOnPanel;
			$('input[type=radio][name=icons-panel][value='+value+']').attr('checked', 'checked');					
		},	
		setTemperType: function() {
		  var temper = options.params.deg;
			$('input[type=radio][name=temper][value='+temper+']').attr('checked', 'checked');			  		
		},
		setWindType: function() {
		  var wind = options.params.wind;
			$('input[type=radio][name=wind][value='+wind+']').attr('checked', 'checked');			  		
		},	
		setPressType: function() {
		  var pressure = options.params.press;
		  if (!pressure) pressure = "mmHg";
			$('input[type=radio][name=pressure][value='+pressure+']').attr('checked', 'checked');			  		
		},	
		setNews: function() {
			var isNews = options.params.news;
		  if (isNews == 'on') $('input[type=checkbox][name=news]').attr('checked', 'checked');	
			if (this.dict.lang != 'ru') $('input[type=checkbox][name=news]').attr("disabled", "disabled"); 
			else $('input[type=checkbox][name=news]').removeAttr("disabled", "");  	  			
		},
		setReloadFrc: function() {
			$("#reloadFrc").empty();		
			for (var i=0; i<this.dict.reloads_time_title.length; i++)
				try {
					$("#reloadFrc").append($('<option value="'+this.delays[i]+'">'+this.dict.reloads_time_title[i]+'</option>'));
					if (this.params.updatetime == this.delays[i]*60000) {
						$("#reloadFrc :nth-child("+(i+1)+")").attr("selected", "selected");
					}
				}
				catch(err) { return; }				
		},
    staticTranslate: function() {
    	var obj = this;
			$('.logo span.text').html(this.dict.title);
			$('#content h1').html(this.dict.opt_title);
			$('.props legend').each($.proxy(function(index, element){
				$(element).html(obj.dict.opt_legend[index]);
			}, obj));
			$('.props ul li label span').each($.proxy(function(index, element){	
				$(element).html(obj.dict.opt_input[index]);
			}, obj));	
			try { setReloadFrc() }
			catch(err) {}
			$('.quick-search input').attr('placeholder',this.dict.opt_search_title);
			$('button span').each($.proxy(function(index, element){	
				$(element).html(obj.dict.opt_btn[index]);
			}, obj));
		},
		setCityList: function(){
			$("#selectCity").html('');
			$.each(this.ids, $.proxy(function(key, val) {
				$("#selectCity").append($('<option value="'+val+'">'+(typeof this.cities[val].name[this.params.lang] != 'undefined'?this.cities[val].name[this.params.lang]:this.cities[val].name)+'</option>'));	
			}, this));
		},
		addCity: function(city) {
			isCity = false;
			var arr = $.map(this.ids, function (value, key) { return value; });
			if (arr.length == 5) {
				$('select[id=selectCity]').find('option').css({'background-color': '#fff9c2'});
				$('.message').html(this.dict.opt_5_city).css({'display': 'block'});
						clearTimeout(this.timeout);
						this.timeout = null;
						this.timeout = setTimeout(function() {
							$('select[id=selectCity]').find('option').css({'background-color': '#fff'});
							$('.message').css({'display': 'none'});											
						}, 1200); 				
				return;
			}
			var i = 0;
			$.each(this.ids, function(key, val){
				if (val == city.id)	isCity = true;
				i++; 
			});	
			if (!isCity) {
				this.ids['city'+i] = city.id;
				this.cities[city.id+''] = city;
				$("#selectCity").append($('<option value="'+city.id+'">'+city.name[this.params.lang]+'</option>'));						  
			}
			else {
				/*$('select[id=selectCity]').find('option').each($.proxy(function(i, item) {
					if ($(item)[0].value == city.id) {
						$($('select[id=selectCity]').find('option').get(i)).css({'background-color': '#fff9c2'});
						clearTimeout(this.timeout);
						this.timeout = null;
						this.timeout = setTimeout(function() {
							$($('select[id=selectCity]').find('option').get(i)).css({'background-color': '#fff'});				
						 }, 1200); 
					}
				}, this));*/		
			}
		},
		updateCities: function() {
			var ids = {};
			var i=0;
			$('#selectCity option').each(function() {
				ids['city'+i] = $(this).val();
				i++;
			});
			this.ids = ids;
		},
		currCityInIds: function() {
			isCurrCity = false;
			$.each(this.ids, $.proxy(function(key, val) {
				if (val == this.params.currCity) isCurrCity = true;
			}, this));
			return isCurrCity;
		},	
 		up: function(){
			var obj=document.getElementById("selectCity");
			var i = $("#selectCity option").index($("#selectCity option:selected"));
		 	if(i>0) {
		   	e1=obj.options[i];
		   	e2=obj.options[i-1];  	
		   	obj.insertBefore(e1,e2);   	
		 	}
		},
		down: function(){
			var obj=document.getElementById("selectCity");
			var i = $("#selectCity option").index($("#selectCity option:selected"));
			if (i<0) return;
		 	if (i<obj.options.length-1) {
		   	e1=obj.options[i];
		   	e2=obj.options[i+1];	   	
		   	obj.insertBefore(e2,e1); 	
		 	}
		},
		setCountryList: function(lang) {
			$("#country").empty();
			$("#district").empty();
			$("#district").attr("disabled", "disabled");		
			$("#city").empty();	
			$("#city").attr("disabled", "disabled");			
			var countryList = countries[lang] || [];			
  		for(var i=0; i<countryList.length; i++) 	
  			$('#country').append('<option value="'+countryList[i].id+'">'+countryList[i].name+'</option>');				
		},
		setDistrictList: function(id) {
			$("#district").attr("disabled", "disabled");
			$("#district").empty();	
			$("#city").empty();
			$("#city").attr("disabled", "disabled");			
			if (id == 0) return;
			lang = this.params.lang;
			$.ajax({
		 		type: "GET",
		 		data: {country: id, lang: lang},
				url: background.ext.districtUrl,
				dataType: "xml",
				success: $.proxy(function(data, status, xhr) {
					$(data).find('item').each(function(val, obj){
						if (val == 0) id = $(obj).attr('id');
						$('#district').append('<option value="'+$(obj).attr('id')+'">'+$(obj).attr('n')+'</option>');		
					});
					if ($(data).find('item').length > 0) {
						$('#district').removeAttr('disabled');
						this.setCitiesList(id, true);
					}
					else this.setCitiesList(id, false);
				}, this)	  
			});							
		},
		setCitiesList: function(id, isDistrict) {
			$("#city").empty();
			$("#city").attr("disabled", "disabled");	
			if (id == 0) return;
			$.ajax({
		 		type: "GET",
		 		data: {country: (isDistrict?0:id), all_langs: 1, district: (isDistrict?id:0)},
				url: background.ext.citiesUrl,
				dataType: "xml",
				success: $.proxy(function(data, status, xhr) {
					$(data).find('item').each(function(val, obj){
						var city = {};
						city.id = $(obj).attr('id');
						city.name = {};						 					
						$.each(langs, function(index) {								
							city.name[langs[index]] = $(obj).attr('n_'+langs[index]);				
						});	
						try {		
							if (typeof city.name[options.params.lang] != 'undefined')			
								$('#city').append('<option value=\''+$(obj).attr('id')+'\' data=\''+$.toJSON(city)+'\'>'+city.name[options.params.lang]+'</option>');	
						}
						catch(err) {}
					});
					if ($(data).find('item').length > 0) {
						$('#city').removeAttr('disabled');
						$('#addfromselect').removeAttr('disabled');	
					}					
				}, this)	  
			});							
		}								
	}
	
	
	window.addEventListener('load', function(){
			options.init();
			}, false
	);