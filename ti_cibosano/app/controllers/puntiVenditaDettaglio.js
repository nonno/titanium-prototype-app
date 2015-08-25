var afterShow = arguments[0].afterShow || function(){};
var onClose = arguments[0].onClose || function(){};
var puntoVendita = arguments[0].puntoVendita;

var openProgressIndicator = function(){
	if (OS_ANDROID) { $.progressIndicator.show();}
};

var closeProgressIndicator = function(){
	if (OS_ANDROID) { $.progressIndicator.hide();}
};

var MapModule;
var MAP_TYPE;
var MapModule = require('ti.map');
var MAP_TYPE = MapModule.NORMAL_TYPE;

var getData = function(pv) {

    var haystack = pv.via;
    if (!haystack){
        haystack = "";
    }
    var needle = new RegExp('via', "i");
    var hasPrefix = haystack.search(needle) != -1;

    needle = new RegExp('piazza', "i");
    hasPrefix = hasPrefix || (haystack.search(needle) != -1);

    needle = new RegExp('p.zza', "i");
    hasPrefix = hasPrefix || (haystack.search(needle) != -1);

    var via = "";
    if (!hasPrefix) {
        via = "VIA ";
    }
    via = via + pv.via;

    return via + ', ' + pv.num + ' ' + pv.cap + ' ' + pv.comune + ' (' + pv.prov + ')' + '\n'
    + 'Tel. ' + pv.tel + ' - Fax ' + pv.fax + '\n'
    + pv.email + '\n' + pv.sito;
};

var formatDistance = function(distance) {
    if (distance == undefined || !_.isNumber(distance) || _.isNaN(distance) || (distance == Number.POSITIVE_INFINITY)) {
        return '';
    }
    if (distance > 9) {
        return 'a ' + Math.round(distance) + ' Km';
    }
    return 'a ' + Math.round(distance * 10) / 10 + ' Km';
};

var getInsegna = function(pv) {
    return '/images/format_' + pv.insegna + '.png';
};

var setPortrait = function() {
    $.spacer_2.hide();
    $.column_3.hide();
    $.column_1.width = '49%';
    $.column_2.width = '49%';
    $.column_3.remove($.datiColonna3);
    $.datiColonna3.top = "12dp";
    $.datiColonna2.add($.datiColonna3);
};

var setLandscape = function() {
    $.spacer_2.show();
    $.column_3.show();
    $.column_1.width = '33%';
    $.column_2.width = '33%';
    $.datiColonna2.remove($.datiColonna3);
    $.datiColonna3.top = 0;
    $.column_3.add($.datiColonna3);
};

var setHandHeld = function(){
    $.spacer_1.show();
    $.spacer_2.show();
    $.column_1.show();
    $.column_1.width = '100%';
    $.column_2.hide();
    $.column_3.hide();
    $.column_3.remove($.datiColonna3);
    $.column_2.remove($.datiColonna2);
    $.datiColonna2.top = "12dp";
    $.datiColonna3.top = "12dp";
	$.datiColonna1.width = "95%";

    $.datiColonna2.add($.datiColonna3);
    $.datiColonna1.add($.datiColonna2);
    $.datiColonna1.add(Ti.UI.createView({backgroundColor:"white",height:"16dp"}));
};

var setOrientation = function() {
    if (Alloy.isTablet){
        if (Ti.Gesture.isPortrait()) {
            setPortrait();
        } else {
            setLandscape();
        }
    }
};

var getOrario = function(puntoVendita, season) {
    var giorni = {};
    _.each(puntoVendita.orari, function(orario) {
        if (!_.isObject(giorni[orario.giorno])) {
            giorni[orario.giorno] = {
                id: orario.giorno
            };
        }
        ;
        giorni[orario.giorno][orario.am_pm] = orario['ora_' + season] ? orario['ora_' + season] : "chiuso";
    });
    return giorni;
};

var backAction = function(){
    onClose();
    $.puntiVenditaDettaglio.close();
};

$.backButton.addEventListener('click', function() {
    backAction();
});

$.nameLabel.text = puntoVendita.denom;
$.dataLabel.text = getData(puntoVendita);
$.distanceLabel.text = formatDistance(puntoVendita.distance);

var latitude = OS_IOS ? puntoVendita.location.latitude : parseFloat(puntoVendita.location.latitude);
var longitude = OS_IOS ? puntoVendita.location.longitude : parseFloat(puntoVendita.location.longitude);

var mapView = MapModule.createView({
    mapType: MAP_TYPE,
    width: '100%',
    height: '100%',
    region: {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
        animate: true
    },
    animate: true,
    regionFit: true,
    userLocation: true
});

mapView.annotations = [MapModule.createAnnotation({
    latitude: latitude,
    longitude: longitude,
    title: puntoVendita.denom
})];



$.map.add(mapView);
if (OS_ANDROID){
	var mapFix = Ti.UI.createView({backgroundColor: 'white', opacity: 0, touchEnabled: false});
	$.map.add(mapFix);
}

$.orarioEstateContent.add(Alloy.createController('puntiVenditaDettaglioOrario', {
    orario: getOrario(puntoVendita, 'est')
}).getView());
$.orarioInvernoContent.add(Alloy.createController('puntiVenditaDettaglioOrario', {
    orario: getOrario(puntoVendita, 'inv')
}).getView());

$.servizi.add(Alloy.createController('puntiVenditaDettaglioTabella', {
    data: puntoVendita.servizi.split(',')
}).getView());

Ti.Gesture.addEventListener('orientationchange', setOrientation);
setOrientation();
if (!Alloy.isTablet) {
    setHandHeld();
}
$.puntiVenditaDettaglio.addEventListener('close', function() {
    Ti.Gesture.removeEventListener('orientationchange', setOrientation);
});

$.puntiVenditaDettaglio.addEventListener('androidback', function(e) {
    e.cancelBubble = true;
    backAction();
});

$.puntiVenditaDettaglio.open();
afterShow();
