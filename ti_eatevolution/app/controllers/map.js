var args = arguments[0] || {},
	$FM = require('favoritesmgr'),
	Repository = require("Repository"),
	Map = require('ti.map');

var file, locali, mapView, listener, currentTab, centerMapOnCurrentPosition, onBookmarkClick, populateMap, onlyFavourites;

locali = Repository.getLocali();
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
	
	var data;
	
	if (params.onlyFavourites) {
		data = _.filter(locali, function(item){
			return $FM.exists(item.id);
		});
	} else {
		data = locali;
	}
	
	mapView.annotations = _.map(data, function(locale) {
		var latitude = OS_IOS ? locale.lat : parseFloat(locale.lat);
		var longitude = OS_IOS ? locale.lon : parseFloat(locale.lon);
		var annotation = Map.createAnnotation({
			latitude : latitude,
			longitude : longitude,
			title : locale.nome,
			locale : locale
		});
		if (OS_IOS) {
			annotation.rightButton = Ti.UI.iPhone.SystemButton.INFO_LIGHT;
		}
		return annotation;
	});
};

listener = function(event) {
	if (event.clicksource == 'rightButton') {
		Alloy.Globals.analyticsEvent({action:'map-open_profile', label:event.annotation.locale.id});
		
		currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
	} else {
		if (event.clicksource != 'pin' && OS_ANDROID) {
			Alloy.Globals.analyticsEvent({action:'map-open_profile', label:event.annotation.locale.id});
			
			currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
		}
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
exports.onBookmarkClick = onBookmarkClick;