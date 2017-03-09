var ProfileRepository = require("ProfileRepository"),
	ProfileTypeRepository = require("ProfileTypeRepository"),
	AdMob = require("AdMob"),
	TiMap = require("ti.map");

var mapView, mapViewClick, currentTab, centerMapOnCurrentPosition, onFiltersClick, populateMap,
	dataToAnnotation, webOrganization, webCampaign, openProfile, modalWindowFilters;

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
	regionFit: true
});
$.mapContainer.add(mapView);

openProfile = function(annotation){
	Alloy.Globals.analyticsEvent({action: "map-open_profile", label: annotation.locale.id});
	
	currentTab.open(Alloy.createController("profile", {
		"profile": annotation.locale,
		"mapSource": annotation
	}).getView());
};

dataToAnnotation = function(locale) {
	var rightView, annotation;
	
	if (OS_IOS){
		rightView = Ti.UI.createButton({
			"title": Alloy.Globals.Icons.fontAwesome.infoCircle,
			"width": 30,
			"height": 30,
			"color": Alloy.CFG.iosColor,
			"backgroundColor": "transparent",
			"font": {
				"fontFamily": "font-awesome",
				"fontSize": 30
			}
		});
	}
	annotation = TiMap.createAnnotation({
		latitude: OS_IOS ? locale.lat : parseFloat(locale.lat),
		longitude: OS_IOS ? locale.lon : parseFloat(locale.lon),
		title: locale.nome,
		locale: locale,
		rightView: rightView,
		customView: Alloy.createController("annotation", {
			type: ProfileTypeRepository.get(locale.tipo) || ProfileTypeRepository.getDefault()
		}).getView()
	});
	if (OS_IOS){
		rightView.addEventListener("click", _.partial(openProfile, annotation));
	}
	
	return annotation;
};

populateMap = function(params){
	params = params || {};
	
	var data, annotations;
	
	Ti.API.debug("map.populateMap");
	
	Alloy.Globals.loading.show();
	
	data = ProfileRepository.filter(Alloy.Globals.Data.profiles, Alloy.Globals.Data.filters);
	annotations = data.map(dataToAnnotation);
	
	if (mapView.annotations && mapView.annotations.length){
		mapView.removeAnnotations(mapView.annotations);
	}
	_.each(annotations, function(annotation){
		mapView.addAnnotation(annotation);
	});
	
	Alloy.Globals.loading.hide();
};

if (OS_ANDROID){
	mapViewClick = function(event) {
		if (event.clicksource === "title"){
			openProfile(event.annotation);
		}
	};
	mapView.addEventListener("click", mapViewClick);
}

onFiltersClick = function(){
	var filtersController = Alloy.createController("filters", {"filters": Alloy.Globals.Data.filters});
	modalWindowFilters = Alloy.createController("modalWindow", {
		"innerController": filtersController,
		"leftNav": [
			{
				"button": Alloy.Globals.createModalWindowHeaderButton({"title": L("lblCancel")}),
				"listener": function(){ modalWindowFilters.close(); }
			}
		],
		"rightNav": [
			{
				"button": Alloy.Globals.createModalWindowHeaderButton({"title": OS_IOS ? L("lblDone") : L("lblConfirm")}),
				"listener": function(){
					Alloy.Globals.analyticsEvent({action: "map-data_filtering"});
					Alloy.Globals.Data.setFilters(filtersController.getFilters());
					
					modalWindowFilters.close();
				}
			}
		],
		"closeFunction": function(){}
	});
	
	modalWindowFilters.open();
};

centerMapOnCurrentPosition = function(){
	if (!mapView.userLocation){ return; }
	
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
				"latitudeDelta": 2,
				"longitudeDelta": 2
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

Ti.App.addEventListener("filterschanged", populateMap);

Ti.App.addEventListener("profilechanged", function(params){
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
		
		var bookmarksButton = Ti.UI.createLabel({
			"text": Alloy.Globals.Icons.fontAwesome.search,
			"color": Alloy.CFG.iosColor,
			"width": 26,
			"height": 26,
			"font": {
				"fontFamily": "font-awesome",
				"fontSize": 26
			}
		});
		bookmarksButton.addEventListener("click", onFiltersClick);
		
		$.map.rightNavButtons = [bookmarksButton];
	}());
}

populateMap();

if (OS_ANDROID && require("UtilsLib").getOSMajorVersion() > 5){
	if (!Ti.Geolocation.hasLocationPermissions()){
		Ti.Geolocation.requestLocationPermissions(function(result){
			if (result.success){
				mapView.userLocation = true;
				
				centerMapOnCurrentPosition();
			}
		});
	}
} else {
	mapView.userLocation = true;
	
	centerMapOnCurrentPosition();
}

exports.showAdvertisement = function(show){
	if (show && OS_IOS){ // TODO
		$.advContainer.height = Alloy.isTablet ? Alloy.CFG.gui.advertisementBannerHeightTablet : Alloy.CFG.gui.advertisementBannerHeight;
		$.mapContainer.bottom = Alloy.isTablet ? Alloy.CFG.gui.advertisementBannerHeightTablet : Alloy.CFG.gui.advertisementBannerHeight;
		
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
exports.onFiltersClick = onFiltersClick;
