var locale = arguments[0] || {},
	Map = require('ti.map'),
	Repository = require('Repository'),
	$FM = require('favoritesmgr');

$.nome.text = locale.nome;
$.tipo.text = Repository.tipoToString(locale.tipo);
$.indirizzo.text = locale.ind;
$.telefono.text = locale.tel;

if (locale.email){
	$.email.text = locale.email;
} else {
	hideContactInfo($.emailContainer);
}

if (locale.web){
	$.web.text = locale.web;
} else {
	hideContactInfo($.webContainer);
}

(function(){
	var aperturaText, todayOpen, todayTimetable;
	
	if (locale.aperto && locale.aperto.length > 0){
		todayOpen = Repository.isLocaleTodayOpen(locale);
		if (todayOpen){
			todayTimetable = Repository.getLocaleTodayTimetable(locale);
			
			aperturaText= L('lblTodayOpen') + ' ' + _.reduce(todayTimetable, function(memo, time){
				memo += memo.length > 0 ? ', ' : '';
				return memo + time.da + '-' + time.a;
			}, '');
		} else {
			aperturaText = L('lblTodayClose');
		}
		$.apertura.text = aperturaText;
	} else {
		hideContactInfo($.aperturaContainer);
	}
}());

$.mapview.setRegion({
	latitude: locale.lat || 43.425505,
	longitude: locale.lon || 11.8668486,
	latitudeDelta:0.1,
	longitudeDelta:0.1,
	zoom:10,
	tilt:45
});

var mapAnnotation = Map.createAnnotation({
	latitude: locale.lat || 43.425505,
	longitude: locale.lon || 11.8668486
});
$.mapview.addAnnotation(mapAnnotation);

// Check that the contact is not already a favorite, and update the favorites button
// title as required.
$FM.exists(locale.id) && $.addFavoriteBtn.setTitle(L('lblRemoveFromFavorites'));

Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.viewed");

function emailContact() {
	Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.emailButton.clicked");
	
	if (OS_IOS && Ti.Platform.model === "Simulator"){
		alert("Simulator does not support sending emails. Use a device instead");
		return;
	}

	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.toRecipients = [locale.email];
	emailDialog.open();
};

function callContact(){
	Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.callContactButton.clicked");
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else if (ENV_PRODUCTION){
		Ti.Platform.openURL("tel:"+locale.phone);
	}
};

function toggleFavorite(){
	if(!$FM.exists(locale.id)){
		Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.addToFavorites.clicked");
	
		$FM.add(locale.id);
		$.addFavoriteBtn.setTitle(L('lblRemoveFromFavorites'));
	} else {
		Ti.Analytics.featureEvent(Ti.Platform.osname+".profile.removeFromFavorites.clicked");
		
		$FM.remove(locale.id);
		$.addFavoriteBtn.setTitle(L('lblAddToFavorites')); 
	}
	
	Ti.App.fireEvent("refresh-data");
};

function hideContactInfo(container){
	container.visible = false;
	container.height = 0;
	container.width = 0;
	container.top = 0;
	container.bottom = 0;
	container.left = 0;
	container.right = 0;
};

function showAdvertisement(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.contactInfo.bottom = Alloy.CFG.gui.advertisementBannerHeight;
	} else {
		$.contactInfo.bottom = 0;
		$.advContainer.height = 0;
	}
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

showAdvertisement(Ti.Network.online);

exports.setTab = function(tab){
	currentTab = tab;
};