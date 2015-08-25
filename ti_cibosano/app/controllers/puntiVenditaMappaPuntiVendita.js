var openPuntoVendita = arguments[0].openPuntoVendita || function(){};

var MapModule;
var MAP_TYPE;
MapModule = require('ti.map');
MAP_TYPE = MapModule.NORMAL_TYPE;

var mapView = MapModule.createView({
    mapType: MAP_TYPE,
    region: {
        latitude: 43.0977,
        longitude: 12.3838,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
        animate: true
    },
    animate: true,
    regionFit: true,
    userLocation: true
});

$.puntiVenditaMappaPuntiVendita.add(mapView);

exports.setPuntiVendita = function(puntiVendita) {
    annotations = _.map(puntiVendita, function(pv) {
        var latitude = OS_IOS ? pv.location.latitude : parseFloat(pv.location.latitude);
        var longitude = OS_IOS ? pv.location.longitude : parseFloat(pv.location.longitude);
        var annotation = MapModule.createAnnotation({
            latitude: latitude,
            longitude: longitude,
            title: pv.denom,
            puntoVendita: pv
        });
        if (OS_IOS) {
            annotation.rightButton = Ti.UI.iPhone.SystemButtonStyle.BAR;
        }
        return annotation;
    });
    mapView.annotations = annotations;
};

var listener = function(event) {
    if(event.clicksource == 'rightButton') {
        openPuntoVendita(event.annotation.puntoVendita);
    } else {
        if(event.clicksource != 'pin' && OS_ANDROID){
            openPuntoVendita(event.annotation.puntoVendita);
        }
    }
};

mapView.addEventListener('click', listener);

exports.unBindListeners = function(){
    mapView.removeEventListener('click', listener);
};