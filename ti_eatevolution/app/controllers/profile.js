var _args = arguments[0] || {},
	Map = require('ti.map'),  // Reference to the MAP API
	$FM = require('favoritesmgr');	  // FavoritesManager helper class for managing favorites

$.nome.text = _args.nome;
$.indirizzo.text = _args.ind;
$.telefono.text = _args.tel;
$.email.text = _args.email;
$.web.text = _args.web;

$.mapview.setRegion({
	latitude: _args.lat || 43.425505,
	longitude: _args.lon || 11.8668486,
	latitudeDelta:2,
	longitudeDelta:2,
	zoom:5,
	tilt:45
});

var mapAnnotation = Map.createAnnotation({
	latitude: _args.lat || 43.425505,
	longitude: _args.lon || 11.8668486
});
$.mapview.addAnnotation(mapAnnotation);

// Check that the contact is not already a favorite, and update the favorites button
// title as required.
$FM.exists(_args.id) && $.addFavoriteBtn.setTitle(L('lblRemoveFromFavorites'));

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
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else if (ENV_PRODUCTION){
		Ti.Platform.openURL("tel:"+_args.phone);
	}
};

function toggleFavorite(){
	if(!$FM.exists(_args.id)){
		Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.addToFavorites.clicked");
	
		$FM.add(_args.id);
		$.addFavoriteBtn.setTitle(L('lblRemoveFromFavorites'));
	} else {
		Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.removeFromFavorites.clicked");
		
		$FM.remove(_args.id);
		$.addFavoriteBtn.setTitle(L('lblAddToFavorites')); 
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