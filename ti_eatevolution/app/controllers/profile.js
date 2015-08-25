var _args = arguments[0] || {},
	Map = require('ti.map'),  // Reference to the MAP API
	$FM = require('favoritesmgr');	  // FavoritesManager helper class for managing favorites

$.nome.text = _args.nome;
$.indirizzo.text = _args.ind;
$.telefono.text = _args.tel;
$.email.text = _args.email;
$.web.text = _args.web;

var lat = OS_ANDROID ? _args.lat+0.75 : _args.lat;
$.mapview.setRegion({
	latitude: lat || 43.425505,
	longitude: _args.lon || 11.8668486,
	latitudeDelta:2,
	longitudeDelta:2,
	zoom:5,
	tilt:45
});

// FIXME android bug with sdk 4.1
if (!OS_ANDROID){
	var mapAnnotation = Map.createAnnotation({
		latitude: lat || 43.425505,
		longitude: _args.lon || 11.8668486,
		customView: Alloy.createController("annotation", {image: _args.photo}).getView(),
		animate:true
	});
	$.mapview.addAnnotation(mapAnnotation);
}

// Check that the contact is not already a favorite, and update the favorites button
// title as required.
$FM.exists(_args.id) && $.addFavoriteBtn.setTitle("- Rimuovi dai preferiti");

Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.viewed");

function emailContact() {
	Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.emailButton.clicked");
	
	if (OS_IOS && Ti.Platform.model === "Simulator"){
		alert("Simulator does not support sending emails. Use a device instead");
		return;
	}

	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.toRecipients = [_args.email];
	emailDialog.open();
};

function callContact(){
	Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.callContactButton.clicked");
	
	var dialog = Ti.UI.createAlertDialog({
		cancel: 0,
		buttonNames: ['No', 'Sì'],
		message: "Sicuro di voler chiamare " + _args.firstName + " al " + _args.phone
	});
	
	dialog.addEventListener('click', function(e){
		if (e.index !== e.source.cancel){
			if (ENV_DEV){
				Ti.Platform.openURL("tel:+393381540774");
			} else if (ENV_PRODUCTION){
				Ti.Platform.openURL("tel:"+_args.phone);
			}
		}
	});
	
	dialog.show();
};

function toggleFavorite(){
	if(!$FM.exists(_args.id)){
		Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.addToFavorites.clicked");
	
		$FM.add(_args.id);
		$.addFavoriteBtn.setTitle("- Rimuovi dai preferiti");
	} else {
		Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.removeFromFavorites.clicked");
		
		$FM.remove(_args.id);
		$.addFavoriteBtn.setTitle("+ Aggiungi ai preferiti"); 
	}
	
	Ti.App.fireEvent("refresh-data");
};

function closeWindow(){
	$.profile.close();
}

$.profile.addEventListener("postlayout", function(e){
	$.profile.animate({
		opacity: 1.0,
		duration: 250,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
});

exports.setTab = function(tab){
	currentTab = tab;
};