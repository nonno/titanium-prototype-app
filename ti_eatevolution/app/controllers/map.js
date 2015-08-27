var args = arguments[0] || {},
	Map = require('ti.map');

var file, locali, mapView, listener, currentTab;

file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
locali = JSON.parse(file.read().text).locali;

mapView = Map.createView({
	mapType : Map.NORMAL_TYPE,
	region : {
		// TODO user position
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
		annotation.rightButton = Ti.UI.iPhone.SystemButtonStyle.BAR;
	}
	return annotation;
}); 

listener = function(event) {
	if (event.clicksource == 'rightButton') {
		currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
	} else {
		if (event.clicksource != 'pin' && OS_ANDROID) {
			currentTab.open(Alloy.createController("profile", event.annotation.locale).getView());
		}
	}
};
mapView.addEventListener('click', listener);


exports.setTab = function(tab){
	currentTab = tab;
};