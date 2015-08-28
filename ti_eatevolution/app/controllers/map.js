var args = arguments[0] || {},
	Map = require('ti.map');

var file, locali, mapView, listener, currentTab, centerMapOnCurrentPosition;

file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
locali = JSON.parse(file.read().text).locali;

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
$.map.add(mapView);

mapView.annotations = _.map(locali, function(locale) {
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

listener = function(event) {
	if (event.clicksource == 'rightButton') {
		// FIXME titanium bug https://jira.appcelerator.org/browse/TIMOB-19215
		currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
	} else {
		if (event.clicksource != 'pin' && OS_ANDROID) {
			currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
		}
	}
};
mapView.addEventListener('click', listener);

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
		
		if (coords){
			Ti.API.debug(JSON.stringify(coords));
			
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

exports.setTab = function(tab){
	currentTab = tab;
};