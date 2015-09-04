var DateUtils = require('DateUtils');

var getLocali, tipoToString, addressToString, getLocaleTodayTimetable, isLocaleTodayOpen;

getLocali = function(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
	
	return JSON.parse(file.read().text).locali;
};

tipoToString = function(tipo){
	return L('lblTipo' + tipo.substring(0,1).toUpperCase() + tipo.substring(1));
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

getLocaleTodayTimetable = function(locale){
	var now, dayOfWeek, i, opening;
	
	var now = new Date();
	dayOfWeek = (now.getDay() + 6) % 7;
	
	for (i in locale.aperto){
		opening = locale.aperto[i];
		
		if (DateUtils.isDateIncluded(opening, now) && opening.gg[dayOfWeek].length > 0){
			return opening.gg[dayOfWeek];
		}
	}
	
	return null;
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

exports.getLocali = getLocali;
exports.tipoToString = tipoToString;
exports.addressToString = addressToString;
exports.getLocaleTodayTimetable = getLocaleTodayTimetable;
exports.isLocaleTodayOpen = isLocaleTodayOpen;