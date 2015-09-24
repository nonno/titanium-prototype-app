var locale = arguments[0] || {},
	Map = require('ti.map'),
	Repository = require('Repository'),
	$FM = require('favoritesmgr'),
	tipoData = Repository.tipiLocali[locale.tipo];

Alloy.Globals.analyticsEvent({action:'profile-open', label:locale.id});

$.nome.text = locale.nome;
$.tipo.text = L(tipoData.text);
$.indirizzo.text = Repository.addressToString(locale);

if (locale.tel){
	$.telefono.text = locale.tel;
} else {
	hideInfoContainer($.telefonoContainer);
}

if (locale.email){
	$.email.text = locale.email;
} else {
	hideInfoContainer($.emailContainer);
}

if (locale.web){
	$.web.text = locale.web;
} else {
	hideInfoContainer($.webContainer);
}

(function(){
	var aperturaText, todayOpen, todayTimetable;
	
	if (locale.aperto && locale.aperto.length > 0){
		todayOpen = Repository.isLocaleTodayOpen(locale);
		if (todayOpen){
			todayTimetable = Repository.getLocaleTodayTimetable(locale);
			
			aperturaText= L('lblTodayOpen') + ' ' + todayTimetable.reduce(function(memo, time){
				memo += memo.length > 0 ? ', ' : '';
				return memo + time.da + '-' + time.a;
			}, '');
		} else {
			aperturaText = L('lblTodayClose');
		}
		$.apertura.text = aperturaText;
	} else {
		hideInfoContainer($.aperturaContainer);
	}
}());

$.tipiCibiValue.text = Repository.getFoodTypes(locale).map(function(tipo){
	return L('cibo.tipo.' + tipo);
}).sort().join(', ').toLowerCase();

$.catCibiValue.text = Repository.getFoodCategories(locale).map(function(cat){
	return L('cibo.cat.' + cat);
}).sort().join(', ').toLowerCase();

if (!$.tipiCibiValue.text){
	hideInfoContainer($.tipiCibiContainer);
}
if (!$.catCibiValue.text){
	hideInfoContainer($.catCibiContainer);
}
if (!$.tipiCibiValue.text && !$.catCibiValue.text){
	hideInfoContainer($.infoCibiContainer);
	hideInfoContainer($.infoCibiSeparator);
}

$.mapview.setRegion({
	latitude: locale.lat || 43.425505,
	longitude: locale.lon || 11.8668486,
	latitudeDelta:0.1,
	longitudeDelta:0.1,
	zoom:15,
	tilt:45
});

var mapAnnotation = Map.createAnnotation({
	latitude: locale.lat || 43.425505,
	longitude: locale.lon || 11.8668486
});
$.mapview.addAnnotation(mapAnnotation);

// Check that the contact is not already a favorite, and update the favorites button
// title as required.
$FM.exists(locale.id) && $.addFavoriteBtn.setColor('yellow');

function callProfile(){
	Alloy.Globals.analyticsEvent({action:'profile-call', label:locale.id});
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else {
		Ti.Platform.openURL("tel:"+locale.tel);
	}
};

function toggleFavorite(){
	if(!$FM.exists(locale.id)){
		Alloy.Globals.analyticsEvent({action:'profile-add_favorite', label:locale.id});
	
		$FM.add(locale.id);
		$.addFavoriteBtn.setColor('yellow');
	} else {
		Alloy.Globals.analyticsEvent({action:'profile-remove_favorite', label:locale.id});
		
		$FM.remove(locale.id);
		$.addFavoriteBtn.setColor(Alloy.CFG.gui.primaryColor);
	}
	
	Ti.App.fireEvent("refresh-data");
};

function reportProfile(){
	Alloy.Globals.analyticsEvent({action:'profile-report', label:locale.id});
	
	if (OS_IOS && Ti.Platform.model === "Simulator"){
		alert("Simulator does not support sending emails. Use a device instead");
		return;
	}

	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.toRecipients = [Alloy.CFG.companyReferences.email];
	emailDialog.subject = L('lblReportProfileMailSubject');
	emailDialog.messageBody = String.format(L('msgReportProfileMailBody'), locale.id, locale.nome);
	emailDialog.open();
};

function hideInfoContainer(container){
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