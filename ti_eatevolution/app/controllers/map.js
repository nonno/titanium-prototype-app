var $FM = require("favoritesmgr"),
	Repository = require("Repository"),
	AdMob = require("AdMob"),
	TiMap = require("ti.map");

var mapView, listener, currentTab, centerMapOnCurrentPosition, onBookmarkClick, populateMap;

mapView = TiMap.createView({
	mapType: TiMap.NORMAL_TYPE,
	region: {
		latitude: 43.0977,
		longitude: 12.3838,
		latitudeDelta: 2,
		longitudeDelta: 2,
		animate: true
	},
	animate: true,
	regionFit: true,
	userLocation: true
});
$.mapContainer.add(mapView);

populateMap = function(params){
	params = params || {};
	
	Ti.API.debug("map.populateMap");
	
	var data;
	
	if (Alloy.Globals.Data.favorites) {
		data = Alloy.Globals.Data.locali.filter(function(item){
			return $FM.exists(item.id);
		});
	} else {
		data = Alloy.Globals.Data.locali;
	}
	
	mapView.annotations = data.map(function(locale) {
		var annotation = TiMap.createAnnotation({
			latitude: OS_IOS ? locale.lat : parseFloat(locale.lat),
			longitude: OS_IOS ? locale.lon : parseFloat(locale.lon),
			title: locale.nome,
			locale: locale,
			customView: Alloy.createController("annotation", {
				type: Repository.getProfileType(locale.tipo)
			}).getView()
		});
		return annotation;
	});
};

listener = function(event) {
	if (!OS_ANDROID || event.clicksource !== "pin") {
		Alloy.Globals.analyticsEvent({action: "map-open_profile", label: event.annotation.locale.id});
		
		currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
	}
};
mapView.addEventListener("click", listener);

onBookmarkClick = function(){
	populateMap();
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
				latitude: 43.0977,
				longitude: 12.3838
			};
		}
		
		if (coords){
			mapView.setRegion({
				"latitude": coords.latitude,
				"longitude": coords.longitude,
				"latitudeDelta": 1,
				"longitudeDelta": 1
			});
		}
	});
};

Ti.App.addEventListener("refresh-data", function(){
	populateMap();
});

centerMapOnCurrentPosition();

populateMap();

exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.mapContainer.bottom = Alloy.CFG.gui.advertisementBannerHeight;
		
		$.advContainer.add(AdMob.create({
			unitId: "ca-app-pub-5803114779573585/3605535158"
		}));
	} else {
		$.advContainer.removeAllChildren();
		
		$.mapContainer.bottom = "0dp";
		$.advContainer.height = "0dp";
	}
};
exports.setTab = function(tab){
	currentTab = tab;
};
exports.refresh = populateMap;
exports.onBookmarkClick = onBookmarkClick;
