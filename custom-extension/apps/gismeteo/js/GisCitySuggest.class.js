function GISCitySuggest(lang){
	this.handlers = {};
	this.delay = 1000;
	this.minLength = 3;
	this.url = '/ajax/avia_search/';
	this.loadingClass = 'o';
	this.clearClass = 'x';
	this.adds_args = {where: 'all'};
	this.result_tpl = "'<span class=\"city @kind\">@city</span>'+('@district'!==''?' - @district':'')+' - @country'";
	this.itemsLength = 6;
}
GISCitySuggest.prototype.setCallback = function(event, handler){
	this.handlers[event] = handler;
}

GISCitySuggest.prototype.init = function(whatID, lang){
	var inputWhat = $(whatID);
	inputWhat.autocomplete({
		delay: this.delay,
		minLength: this.minLength,
		autoFocus: true,
		source: $.proxy(function(request, response){
			$('.'+this.clearClass).addClass(this.loadingClass);
			$('.'+this.clearClass).show();
			var data = {startsWith: request.term, all_langs: 1};
			for(key in this.adds_args)
				data[key] = this.adds_args[key];			
			$.ajax({
				url: this.url,
				dataType: "xml",
				data: data,
				context: {obj:this},
				success: $.proxy(function(data){
					var map = $.map($(data).find('item'), $.proxy(function(item, i){
						item = $(item);
						var text = this.result_tpl.replace(/@kind/g, item.attr('kind')).replace(/@city/g, item.attr('n_'+lang)).replace(/@country/g, (item.attr('country_'+lang)?item.attr('country_'+lang):'')).replace(/@district/g, (item.attr('district_'+lang)?item.attr('district_'+lang)+', ':''));
						var res = {
							label: text,
							/*label: text.replace(
							new RegExp(
								'(?![^&;]+;)(?!<[^<>]*)('+ 
								$.ui.autocomplete.escapeRegex(request.term)+'|'+$.ui.autocomplete.escapeRegex(data.cnv)+
								')(?![^<>]*>)(?![^&;]+;)', 'gi'
							), '<strong>$1</strong>'),*/
							value: item.attr('n_'+lang),
							id: item.attr('id'),
							item: item,
							option: this
						};
						return (i <= this.itemsLength)?res:null;
					}, this));
					response(map);
					$('.'+this.clearClass).removeClass(this.loadingClass);					
				}, this),
				error: $.proxy(function(){
					$('.'+this.clearClass).removeClass(this.loadingClass);	
				}, this)
			});
		}, this),
		select: $.proxy(function(event, ui){
			if(this.handlers['select'])
				this.handlers['select'](event, ui);
		}, this)
	})
	.removeClass('ui-corner-all ui-autocomplete-input');
	
	inputWhat.data('autocomplete')._renderItem = function(ul, item){
		ul.removeClass('ui-corner-all');
		return $('<li></li>')
		.data('item.autocomplete', item )
		.append('<a>'+item.label+'</a>')
		.appendTo(ul);
	};	
}