var moment = require("alloy/moment"),
	MomentRange = require("moment-range");

var getTimeInterval, isDateIncluded;

getTimeInterval = function(obj){
	if (!obj.a || !obj.da){
		throw {"message": "Invalid object"};
	}
	
	var timeInterval, currentYear;
	
	currentYear = (new Date()).getFullYear();
	
	timeInterval = "";
	
	if (obj.da.indexOf("0000") > -1){
		timeInterval += obj.da.replace("0000", currentYear);
	} else {
		timeInterval += obj.da;
	}
	if (obj.da.indexOf("T") > -1){
		timeInterval += "+00:00";
	} else {
		timeInterval += "T00:00:00+00:00";
	}
	
	timeInterval += "/";
	
	if (obj.a.indexOf("0000") > -1){
		timeInterval += obj.a.replace("0000", currentYear);
	} else {
		timeInterval += obj.a;
	}
	if (obj.a.indexOf("T") > -1){
		timeInterval += "+00:00";
	} else {
		timeInterval += "T23:59:59+00:00";
	}
	
	return timeInterval;
};

isDateIncluded = function(obj, date){
	date = date || new Date();
	
	var timeInterval = getTimeInterval(obj);
	
	return moment.range(timeInterval).contains(date);
};

exports.isDateIncluded = isDateIncluded;
