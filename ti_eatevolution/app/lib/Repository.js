var DateUtils = require('DateUtils');

var tipiLocali, getLocali, addressToString, getLocaleTodayTimetable, isLocaleTodayOpen,
	getFoodTypes, getFoodCategories;

tipiLocali = {
	'ris': {'text':'locale.tipo.ris','icon':'\ue008','color':'red'},
	'gel': {'text':'locale.tipo.gel','icon':'\ue010','color':'cyan'},
	'pas': {'text':'locale.tipo.pas','icon':'\ue01c','color':'purple'},
	'for': {'text':'locale.tipo.for','icon':'\ue003','color':'brown'},
	'bar': {'text':'locale.tipo.bar','icon':'\ue004','color':'maroon'},
	'tc': {'text':'locale.tipo.tc','icon':'\ue017','color':'olive'},
	'ag': {'text':'locale.tipo.ag','icon':'\ue017','color':'olive'},
	'ros': {'text':'locale.tipo.ros','icon':'\ue014','color':'pink'},
	'ff': {'text':'locale.tipo.ff','icon':'\ue00e','color':'orange'}
};

getLocali = function(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
	
	return JSON.parse(file.read().text).locali;
};

addressToString = function(locale){
	var addressComp, address;
	
	addressComp = [];
	if (locale.ind){
		addressComp.push(locale.ind);
	}
	if (locale.cap){
		addressComp.push(locale.cap);
	}
	if (locale.loc){
		addressComp.push(locale.loc);
	}
	address = addressComp.join(", ");
	
	if (locale.prov){
		address += " (" + locale.prov + ")";
	}
	return address;
};

getLocaleTodayTimetable = function(locale, now){
	now = now || new Date();
	
	if (!locale || !locale.aperto || !locale.aperto.length){
		return [];
	}
	
	var now, dayOfWeek, i, opening;
	
	dayOfWeek = (now.getDay() + 6) % 7;
	
	for (i in locale.aperto){
		opening = locale.aperto[i];
		
		if (DateUtils.isDateIncluded(opening, now)){
			if (opening.gg.length > dayOfWeek && opening.gg[dayOfWeek].length > 0){
				return opening.gg[dayOfWeek];
			}
		}
	}
	
	return [];
};

isLocaleTodayOpen = function(locale){
	var now = new Date();
	
	var closed = false;
	_.each(locale.chiuso, function(closing){
		closed = closed || DateUtils.isDateIncluded(closing, now);
	});
	if (closed){
		return false;
	}
	
	var timetable = getLocaleTodayTimetable(locale);
	return Boolean(timetable) && (timetable.length > 0);
};

getFoodTypes = function(locale){
	if (!locale || !locale.cibi || !locale.cibi.length){
		return [];
	}
	
	return _.uniq(locale.cibi.reduce(function(memo, cibo){
		if (cibo.tipo){
			memo.push(cibo.tipo);
		}
		return memo;
	}, []));
};

getFoodCategories = function(locale){
	if (!locale || !locale.cibi || !locale.cibi.length){
		return [];
	}
	
	return _.uniq(locale.cibi.reduce(function(memo, cibo){
		if (cibo.cat && cibo.cat.length){
			memo = memo.concat(cibo.cat);
		}
		return memo;
	}, []));
};

exports.getLocali = getLocali;
exports.addressToString = addressToString;
exports.getLocaleTodayTimetable = getLocaleTodayTimetable;
exports.isLocaleTodayOpen = isLocaleTodayOpen;
exports.getFoodTypes = getFoodTypes;
exports.getFoodCategories = getFoodCategories;
exports.tipiLocali = tipiLocali;