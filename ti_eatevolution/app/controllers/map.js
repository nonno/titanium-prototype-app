var args = arguments[0] || {},
	$FM = require('favoritesmgr'),
	Repository = require("Repository"),
	Admob = OS_ANDROID ? require('ti.admob') : null,
	Map = require('ti.map');

var file, mapView, listener, currentTab, centerMapOnCurrentPosition, onBookmarkClick, populateMap,
	onlyFavourites, adMobView;

onlyFavourites = false;

mapView = Map.createView({
	mapType : Map.NORMAL_TYPE,
	region : {
		latitude : 43.0977,
		longitude : 12.3838,
		latitudeDelta : 2,
		longitudeDelta : 2,
		animate : true
	},
	animate : true,
	regionFit : true,
	userLocation : true
});
$.mapContainer.add(mapView);

populateMap = function(params){
	params = params || {};
	params.onlyFavourites = params.onlyFavourites || false;
	
	Ti.API.debug("map.populateMap");
	
	var data;
	
	if (params.onlyFavourites) {
		data = Alloy.Globals.Data.locali.filter(function(item){
			return $FM.exists(item.id);
		});
	} else {
		data = Alloy.Globals.Data.locali;
	}
	
	mapView.annotations = data.map(function(locale) {
		var annotation = Map.createAnnotation({
			latitude : OS_IOS ? locale.lat : parseFloat(locale.lat),
			longitude : OS_IOS ? locale.lon : parseFloat(locale.lon),
			title : locale.nome,
			locale : locale,
			customView: Alloy.createController("annotation", {
				type: Repository.getProfileType(locale.tipo)
			}).getView(),
		});
		return annotation;
	});
};

listener = function(event) {
	if (!OS_ANDROID || event.clicksource !== 'pin') {
		Alloy.Globals.analyticsEvent({action:'map-open_profile', label:event.annotation.locale.id});
		
		currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
	}
};
mapView.addEventListener('click', listener);

onBookmarkClick = function(e){
	onlyFavourites = !onlyFavourites;

	populateMap({'onlyFavourites' : onlyFavourites});
};

centerMapOnCurrentPosition = function(){
	Ti.Geolocation.getCurrentPosition(function(e){
		var coords;
		
		if (e.success && e.coords) {
			Ti.API.debug("Current position: ");
			coords = e.coords;
		} else if (Ti.Geolocation.lastGeolocation){
			Ti.API.debug("Last position: ");
			coords = Ti.Geolocation.lastGeolocation;
		}
		
		if (ENV_DEV && OS_IOS){
			coords = {
				latitude : 43.0977,
				longitude : 12.3838
			};
		}
		
		if (coords){
			mapView.setRegion({
				'latitude' : coords.latitude,
				'longitude' : coords.longitude,
				'latitudeDelta' : 1,
				'longitudeDelta' : 1,
			});
		}
	});
};

Ti.App.addEventListener("refresh-data", function(e){
	populateMap();
});

if (OS_ANDROID){
	adMobView = Admob.createView({
		publisherId:"ca-app-pub-5803114779573585/3605535158"
	});
	adMobView.addEventListener(Admob.AD_RECEIVED, function(e){
		Ti.API.debug("Ad received " + JSON.stringify(e));
	});
	adMobView.addEventListener(Admob.AD_NOT_RECEIVED, function(e){
		Ti.API.debug("Ad not received " + JSON.stringify(e));
	});
	$.advContainer.add(adMobView);
}

centerMapOnCurrentPosition();

populateMap();

exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.mapContainer.bottom = Alloy.CFG.gui.advertisementBannerHeight;
	} else {
		$.mapContainer.bottom = "0dp";
		$.advContainer.height = "0dp";
	}
};
exports.setTab = function(tab){
	currentTab = tab;
};
exports.refresh = populateMap;
exports.onBookmarkClick = onBookmarkClick;