var $FM = require("favoritesmgr"),
	ProfileTypeRepository = require("ProfileTypeRepository"),
	AdMob = require("AdMob"),
	TiMap = require("ti.map");

var mapView, listener, currentTab, centerMapOnCurrentPosition, onBookmarkClick, populateMap,
	dataToAnnotation, webOrganization, webCampaign;

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

dataToAnnotation = function(locale) {
	return TiMap.createAnnotation({
		latitude: OS_IOS ? locale.lat : parseFloat(locale.lat),
		longitude: OS_IOS ? locale.lon : parseFloat(locale.lon),
		title: locale.nome,
		locale: locale,
		customView: Alloy.createController("annotation", {
			type: ProfileTypeRepository.getType(locale.tipo) || ProfileTypeRepository.getDefaultType()
		}).getView()
	});
};

populateMap = function(params){
	params = params || {};
	
	var data, annotations;
	
	Ti.API.debug("map.populateMap");
	
	Alloy.Globals.loading.show();
	
	if (Alloy.Globals.Data.favorites) {
		data = Alloy.Globals.Data.locali.filter(function(item){
			return $FM.exists(item.id);
		});
	} else {
		data = Alloy.Globals.Data.locali;
	}
	
	annotations = data.map(dataToAnnotation);
	
	if (mapView.annotations && mapView.annotations.length){
		mapView.removeAnnotations(mapView.annotations);
	}
	_.each(annotations, function(annotation){
		mapView.addAnnotation(annotation);
	});
	
	Alloy.Globals.loading.hide();
};

listener = function(event) {
	if (!OS_ANDROID || event.clicksource !== "pin") {
		Alloy.Globals.analyticsEvent({action: "map-open_profile", label: event.annotation.locale.id});
		
		currentTab.open(Alloy.createController("profile", {
			"profile": event.annotation.locale,
			"mapSource": event.annotation
		}).getView());
	}
};
mapView.addEventListener("click", listener);

onBookmarkClick = function(){
	if (OS_IOS){
		Alloy.Globals.Data.favorites = !Alloy.Globals.Data.favorites;
	}
	
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

webOrganization = function(){
	Alloy.Globals.analyticsEvent({action: "map-organization"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.web);
};
webCampaign = function(){
	Alloy.Globals.analyticsEvent({action: "map-campaign"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.campaign);
};

Ti.App.addEventListener("profile-changed", function(params){
	params = params || {};
	params.profile = params.profile;
	params.mapSource = params.mapSource;
	
	// TODO probably better don't do anything
	//populateMap();
});

if (OS_IOS){
	(function(){
		var nsfLogo = Alloy.Globals.createNSFLogo();
		nsfLogo.addEventListener("singletap", webOrganization);
		$.map.leftNavButton = nsfLogo;
		
		var bookmarksButton = Ti.UI.createButton({
			"systemButton": Ti.UI.iPhone.SystemButton.BOOKMARKS
		});
		bookmarksButton.addEventListener("click", onBookmarkClick);
		
		$.map.rightNavButtons = [bookmarksButton];
	}());
}

centerMapOnCurrentPosition();

populateMap();

exports.showAdvertisement = function(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.mapContainer.bottom = Alloy.CFG.gui.advertisementBannerHeight;
		
		$.advContainer.removeAllChildren();
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
