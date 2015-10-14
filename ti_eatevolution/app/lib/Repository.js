var Request = require("Request"),
	q = require("q"),
	DateUtils = require("DateUtils"),
	GeoUtils = require("GeoUtils");

var getDataFile, profileTypes, fetchDataOffline, fetchDataOnline, addressToString, getProfileType,
	getLocaleTodayTimetable, isLocaleTodayOpen, getFoodTypes, getFoodCategories, calculateDistances;

profileTypes = {
	"bar": {text: "locale.tipo.bar", icon: Alloy.Globals.Icons.profileTypes.bar, color: "maroon"},
	"ff": {text: "locale.tipo.ff", icon: Alloy.Globals.Icons.profileTypes.ff, color: "orange"},
	"for": {text: "locale.tipo.for", icon: Alloy.Globals.Icons.profileTypes.for, color: "brown"},
	"gel": {text: "locale.tipo.gel", icon: Alloy.Globals.Icons.profileTypes.gel, color: "cyan"},
	"pas": {text: "locale.tipo.pas", icon: Alloy.Globals.Icons.profileTypes.pas, color: "purple"},
	"piz": {text: "locale.tipo.piz", icon: Alloy.Globals.Icons.profileTypes.piz, color: "red"},
	"ris": {text: "locale.tipo.ris", icon: Alloy.Globals.Icons.profileTypes.ris, color: "gray"},
	"ros": {text: "locale.tipo.ros", icon: Alloy.Globals.Icons.profileTypes.ros, color: "pink"},
	"tc": {text: "locale.tipo.tc", icon: Alloy.Globals.Icons.profileTypes.tc, color: "olive"}
};

getDataFile = function(){
	if (OS_IOS){
		return Ti.Filesystem.getFile(Ti.Filesystem.applicationSupportDirectory, "data.json");
	}
	return Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data.json");
};

fetchDataOffline = function(){
	Ti.API.debug("Repository.fetchDataOffline");
	var file, data;
	
	file = getDataFile();
	if (!file.exists() || !file.size){
		file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "data/data.json");
	}
	
	data = JSON.parse(file.read().text);
	
	Alloy.Globals.Data.date = data.date;
	Alloy.Globals.Data.locali = data.locali;
};
fetchDataOnline = function(params){
	Ti.API.debug("Repository.fetchDataOnline");
	var defer = q.defer();
	
	Request.get(Alloy.CFG.dataUrl, {
		"success": function(res){
			var file, data;
			
			try {
				data = JSON.parse(res);
				
				if (!data || !data.locali){
					throw {"message": L("msgSyncErrorDataMalformed")};
				} else if (Ti.App.version !== data.appVersion){
					throw {"message": L("msgSyncErrorAppOutdated"), "showAlert": true};
				} else if (data.date <= Alloy.Globals.Data.date){
					throw {"message": L("msgSyncErrorNoDataUpdate")};
				} else {
					file = getDataFile();
					Ti.API.debug("Writing data on file " + file.resolve());
					file.write(res);
					
					// TODO handle mix of data (for don't loose added properties like distances)
					Alloy.Globals.Data.locali = data.locali;
					Alloy.Globals.Data.date = data.date;
					
					defer.resolve("Data replaced");
				}
			} catch(err){
				defer.reject(err);
			}
		},
		"error": function(err){
			defer.reject(err);
		}
	});
	
	return defer.promise;
};
calculateDistances = function(params){
	Ti.API.debug("Repository.calculateDistances");
	var defer = q.defer();
	
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.success && e.coords) {
			Alloy.Globals.Data.locali = Alloy.Globals.Data.locali.map(function(locale) {
				if (locale.lat && locale.lon){
					locale.distanza = GeoUtils.calculateDistance({"latitude": locale.lat, "longitude": locale.lon}, e.coords);
				}
				return locale;
			});
			defer.resolve();
		} else {
			defer.reject(e.error);
		}
	});
	
	return defer.promise;
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
	
	var dayOfWeek, i, opening;
	
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

getProfileType = function(type){
	var value, defaultType;
	defaultType = "ris";
	if (!type){
		Ti.API.warn("getProfileType called with no type");
		type = defaultType;
	}
	value = profileTypes[type];
	if (!value){
		Ti.API.warn("getProfileType called with no existent type " + type);
		value = profileTypes[defaultType];
	}
	return value;
};

exports.getDataFile = getDataFile;
exports.fetchDataOffline = fetchDataOffline;
exports.fetchDataOnline = fetchDataOnline;
exports.calculateDistances = calculateDistances;
exports.addressToString = addressToString;
exports.getLocaleTodayTimetable = getLocaleTodayTimetable;
exports.isLocaleTodayOpen = isLocaleTodayOpen;
exports.getFoodTypes = getFoodTypes;
exports.getFoodCategories = getFoodCategories;
exports.getProfileType = getProfileType;
