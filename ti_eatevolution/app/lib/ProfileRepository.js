var Request = require("Request"),
	$FM = require("favoritesmgr"),
	q = require("q"),
	DateUtils = require("DateUtils"),
	VersionChecker = require("VersionChecker"),
	GeoUtils = require("GeoUtils");

var getAssetDataFile, getDataFile, fetchDataOffline, fetchDataOnline, addressToString,
	getTodayTimetable, isTodayOpen, getFoodTypes, getFoodCategories, calculateDistances,
	filterForTypes, filterForMealTypes, filterForMealCategories, filter,
	isOfOneType, hasAllMealTypes, hasAllMealCategories;

getAssetDataFile = function(){
	return Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "data/data.json");
};

getDataFile = function(){
	if (OS_IOS){
		return Ti.Filesystem.getFile(Ti.Filesystem.applicationSupportDirectory, "data.json");
	}
	return Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "data.json");
};

fetchDataOffline = function(){
	Ti.API.debug("ProfileRepository.fetchDataOffline");
	var file, data;
	
	file = getDataFile();
	if (!file.exists() || !file.size){
		Alloy.Globals.justInstalled = true;
		file.write(getAssetDataFile().read());
	}
	
	data = JSON.parse(file.read().text);
	
	Alloy.Globals.Data.date = data.date;
	Alloy.Globals.Data.setProfiles(data.locali);
};
fetchDataOnline = function(params){
	params = params || {};
	params.useTestData = params.useTestData || false;
	
	Ti.API.debug("ProfileRepository.fetchDataOnline");
	var defer, url;
	
	defer = q.defer();
	if (params.useTestData || Alloy.CFG.development){
		Ti.API.debug("Downloading test file");
		url = Alloy.CFG.dataTestUrl;
	} else {
		url = Alloy.CFG.dataUrl;
	}
	
	Request.get(url, {
		"success": function(res){
			var file, data;
			
			try {
				data = JSON.parse(res);
				
				if (data){
					Ti.API.debug("Data date: " + data.date);
					Ti.API.debug("Data app min version: " + data.appMinVersion);
				}
				Ti.API.debug("Current data date: " + Alloy.Globals.Data.date);
				
				if (!data || !data.locali){
					throw {"message": L("msgSyncErrorDataMalformed")};
				} else if (VersionChecker.compare(Ti.App.version, data.appMinVersion) === 2){
					throw {"message": L("msgSyncErrorAppOutdated"), "showAlert": true};
				} else if (
					(OS_IOS && data.currentIosVersion && Ti.App.version !== data.currentIosVersion)
					||
					(OS_ANDROID && data.currentAndroidVersion && Ti.App.version !== data.currentAndroidVersion)
				){
					throw {"message": L("msgSyncErrorAppOutdated")};
				} else if (!params.useTestData && Alloy.Globals.Data.date && data.date <= Alloy.Globals.Data.date){
					throw {"message": L("msgSyncErrorNoDataUpdate")};
				} else {
					file = getDataFile();
					Ti.API.debug("Writing data on file " + file.resolve());
					file.write(res);
					
					// TODO handle mix of data (for don't loose added properties like distances)
					Alloy.Globals.Data.setProfiles(data.locali);
					Alloy.Globals.Data.date = data.date;
					
					if (params.useTestData){
						Ti.API.debug("Deleting current data date");
						Alloy.Globals.Data.date = null;
					}
					
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
calculateDistances = function(){
	Ti.API.debug("ProfileRepository.calculateDistances");
	var defer = q.defer();
	
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.success && e.coords) {
			Alloy.Globals.Data.setProfiles(Alloy.Globals.Data.profiles.map(function(profile) {
				if (profile.lat && profile.lon){
					profile.distanza = GeoUtils.calculateDistance({"latitude": profile.lat, "longitude": profile.lon}, e.coords);
				}
				return profile;
			}), true);
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

getTodayTimetable = function(locale, now){
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

isTodayOpen = function(locale){
	var now = new Date();
	
	var closed = false;
	_.each(locale.chiuso, function(closing){
		closed = closed || DateUtils.isDateIncluded(closing, now);
	});
	if (closed){
		return false;
	}
	
	var timetable = getTodayTimetable(locale);
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

isOfOneType = function(types, profile){
	if (profile.tipo){
		return types.indexOf(profile.tipo) > -1;
	}
	return true;
};
filterForTypes = function(profiles, types){
	if (types && types.length){
		return profiles.filter(_.partial(isOfOneType, types));
	}
	return profiles;
};

hasAllMealTypes = function(mealTypes, profile){
	var profileMealTypes = profile.cibi ? profile.cibi.map(function(cibo){ return cibo.tipo; }) : [];
	
	return _.intersection(profileMealTypes, mealTypes).length === mealTypes.length;
};
filterForMealTypes = function(profiles, mealTypes){
	if (mealTypes && mealTypes.length){
		return profiles.filter(_.partial(hasAllMealTypes, mealTypes));
	}
	return profiles;
};

hasAllMealCategories = function(mealCategories, profile){
	var i, cat;
	for (i in profile.cibi){
		cat = profile.cibi[i].cat;
		if (_.intersection(cat, mealCategories).length === mealCategories.length){
			return true;
		}
	}
	return false;
};
filterForMealCategories = function(profiles, mealCategories){
	if (mealCategories && mealCategories.length){
		return profiles.filter(_.partial(hasAllMealCategories, mealCategories));
	}
	return profiles;
};

filter = function(profiles, params){
	params = params || {};
	params.nome = params.nome;
	params.asporto = params.asporto;
	params.sedere = params.sedere;
	params.disabili = params.disabili;
	params.pos = params.pos;
	params.dormire = params.dormire;
	params.costo = params.costo;
	params.preferiti = params.preferiti;
	params.aperto = params.aperto;
	params.tipi = params.tipi;
	params.tipiCibi = params.tipiCibi;
	params.categorieCibi = params.categorieCibi;
	params.coordinate = params.coordinate;
	
	if (!_.isUndefined(params.nome)){
		profiles = profiles.filter(function(profile){
			return profile.nome.toLowerCase().indexOf(params.nome.toLowerCase()) !== -1;
		});
	}
	if (!_.isUndefined(params.asporto)){
		profiles = profiles.filter(function(profile){
			return (params.asporto && profile.asporto) || (!params.asporto && !profile.asporto);
		});
	}
	if (!_.isUndefined(params.sedere)){
		profiles = profiles.filter(function(profile){
			return (params.sedere && profile.sedere) || (!params.sedere && !profile.sedere);
		});
	}
	if (!_.isUndefined(params.disabili)){
		profiles = profiles.filter(function(profile){
			return (params.disabili && profile.disabili) || (!params.disabili && !profile.disabili);
		});
	}
	if (!_.isUndefined(params.pos)){
		profiles = profiles.filter(function(profile){
			return (params.pos && profile.pos) || (!params.pos && !profile.pos);
		});
	}
	if (!_.isUndefined(params.dormire)){
		profiles = profiles.filter(function(profile){
			return (params.dormire && profile.dormire) || (!params.dormire && !profile.dormire);
		});
	}
	if (!_.isUndefined(params.costo)){
		profiles = profiles.filter(function(profile){
			return (
				Boolean(profile.costo)
				&&
				(profile.costo <= params.costo.max)
				&&
				(profile.costo >= params.costo.min)
			);
		});
	}
	if (params.preferiti){
		profiles = profiles.filter(function(profile){
			return $FM.exists(profile.id);
		});
	}
	if (!_.isUndefined(params.aperto)){
		profiles = profiles.filter(function(profile){
			var open = isTodayOpen(profile);
			return (params.aperto && open) || (!params.aperto && !open);
		});
	}
	
	profiles = filterForTypes(profiles, params.tipi);
	profiles = filterForMealTypes(profiles, params.tipiCibi);
	profiles = filterForMealCategories(profiles, params.categorieCibi);
	
	return profiles;
};

exports.getAssetDataFile = getAssetDataFile;
exports.getDataFile = getDataFile;
exports.fetchDataOffline = fetchDataOffline;
exports.fetchDataOnline = fetchDataOnline;
exports.calculateDistances = calculateDistances;
exports.addressToString = addressToString;
exports.getTodayTimetable = getTodayTimetable;
exports.isTodayOpen = isTodayOpen;
exports.getFoodTypes = getFoodTypes;
exports.getFoodCategories = getFoodCategories;
exports.isOfOneType = isOfOneType;
exports.hasAllMealTypes = hasAllMealTypes;
exports.hasAllMealCategories = hasAllMealCategories;
exports.filterForTypes = filterForTypes;
exports.filterForMealTypes = filterForMealTypes;
exports.filterForMealCategories = filterForMealCategories;
exports.filter = filter;
