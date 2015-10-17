var args = arguments[0] || {},
	TiMap = require("ti.map"),
	Repository = require("Repository"),
	$FM = require("favoritesmgr"),
	AdMob = require("AdMob");

var profile, typeData, currentTab, listSource, mapSource;

function callProfile(){
	Alloy.Globals.analyticsEvent({action: "profile-call", label: profile.id});
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else {
		Ti.Platform.openURL("tel:" + profile.tel);
	}
}

function toggleFavorite(){
	if(!$FM.exists(profile.id)){
		Alloy.Globals.analyticsEvent({action: "profile-add_favorite", label: profile.id});
	
		$FM.add(profile.id);
		$.addFavoriteBtn.setColor("yellow");
	} else {
		Alloy.Globals.analyticsEvent({action: "profile-remove_favorite", label: profile.id});
		
		$FM.remove(profile.id);
		$.addFavoriteBtn.setColor(Alloy.CFG.gui.primaryColor);
	}
	
	Ti.App.fireEvent("profile-changed", {
		"profile": profile,
		"listSource": listSource,
		"mapSource": listSource
	});
}

function reportProfile(){
	Alloy.Globals.analyticsEvent({action: "profile-report", label: profile.id});
	
	if (OS_IOS && Ti.Platform.model === "Simulator"){
		alert("Simulator does not support sending emails. Use a device instead");
		return;
	}

	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.toRecipients = [Alloy.CFG.companyReferences.email];
	emailDialog.subject = L("lblReportProfileMailSubject");
	emailDialog.messageBody = String.format(L("msgReportProfileMailBody"), profile.id, profile.nome);
	emailDialog.open();
}

function hideInfoContainer(container){
	container.visible = false;
	container.height = 0;
	container.width = 0;
	container.top = 0;
	container.bottom = 0;
	container.left = 0;
	container.right = 0;
}

function showAdvertisement(show){
	if (show){
		$.advContainer.height = Alloy.CFG.gui.advertisementBannerHeight;
		$.contactInfo.bottom = Alloy.CFG.gui.advertisementBannerHeight;
		
		$.advContainer.add(AdMob.create({
			unitId: "ca-app-pub-5803114779573585/5082268359"
		}));
	} else {
		$.advContainer.removeAllChildren();
		
		$.contactInfo.bottom = 0;
		$.advContainer.height = 0;
	}
}

function closeWindow(){
	$.profile.close();
}

function configFlag(value, field, container){
	if (_.isBoolean(value)){
		if (value){
			field.text = Alloy.Globals.Icons.fontAwesome.checkCircle;
			field.color = Alloy.CFG.gui.primaryColor;
		} else {
			field.text = Alloy.Globals.Icons.fontAwesome.timesCircle;
			field.color = Alloy.CFG.gui.secondaryColor;
		}
	} else {
		hideInfoContainer(container);
	}
}

profile = args.profile;
listSource = args.listSource;
mapSource = args.mapSource;
typeData = Repository.getProfileType(profile.tipo);

Alloy.Globals.analyticsEvent({action: "profile-open", label: profile.id});

$.nome.text = profile.nome;
$.tipo.text = L(typeData.text);
$.indirizzo.text = Repository.addressToString(profile);

if (profile.tel){
	$.telefono.text = profile.tel;
} else {
	hideInfoContainer($.telefonoContainer);
}

if (profile.email){
	$.email.text = profile.email;
} else {
	hideInfoContainer($.emailContainer);
}

if (profile.web){
	$.web.text = profile.web.replace("https://", "").replace("http://", "");
} else {
	hideInfoContainer($.webContainer);
}

(function(){
	var aperturaText, todayOpen, todayTimetable;
	
	if (profile.aperto && profile.aperto.length > 0){
		todayOpen = Repository.isLocaleTodayOpen(profile);
		if (todayOpen){
			todayTimetable = Repository.getLocaleTodayTimetable(profile);
			
			aperturaText = L("lblTodayOpen") + " " + todayTimetable.reduce(function(memo, time){
				memo += memo.length > 0 ? ", " : "";
				return memo + time.da + "-" + time.a;
			}, "");
		} else {
			aperturaText = L("lblTodayClose");
		}
		$.apertura.text = aperturaText;
	} else {
		hideInfoContainer($.aperturaContainer);
	}
}());

// food types section
$.tipiCibiValue.text = Repository.getFoodTypes(profile).map(function(tipo){
	return L("cibo.tipo." + tipo);
}).sort().join(", ").toLowerCase();

$.catCibiValue.text = Repository.getFoodCategories(profile).map(function(cat){
	return L("cibo.cat." + cat);
}).sort().join(", ").toLowerCase();

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


// flags section
if (profile.costo){
	$.costo.text = Array(profile.costo + 1).join(Alloy.Globals.Icons.fontAwesome.money + " ");
} else {
	hideInfoContainer($.costoContainer);
}

configFlag(profile.asporto, $.asporto, $.asportoContainer);
configFlag(profile.sedere, $.sedere, $.sedereContainer);
configFlag(profile.disabili, $.disabili, $.disabiliContainer);
configFlag(profile.pos, $.pos, $.posContainer);


// map section
$.mapview.setRegion({
	latitude: profile.lat || 43.425505,
	longitude: profile.lon || 11.8668486,
	latitudeDelta: 0.01,
	longitudeDelta: 0.01,
	zoom: 15,
	tilt: 45
});
$.mapview.addAnnotation(TiMap.createAnnotation({
	latitude: profile.lat || 43.425505,
	longitude: profile.lon || 11.8668486
}));

if ($FM.exists(profile.id)) {
	$.addFavoriteBtn.setColor("yellow");
}

$.profile.addEventListener("postlayout", function(){
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
