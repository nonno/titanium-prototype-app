var args = arguments[0] || {},
	TiMap = require("ti.map"),
	ProfileRepository = require("ProfileRepository"),
	ProfileTypeRepository = require("ProfileTypeRepository"),
	$FM = require("favoritesmgr"),
	AdMob = require("AdMob");

var profile, typeData, currentTab, listSource, mapSource, orientationchange,
	generateMapImage, generateMap, openExternalMap;

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
	
	Ti.App.fireEvent("profilechanged", {
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
	emailDialog.messageBody = String.format(L("msgReportProfileMailBody"), profile.nome, profile.loc);
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
		$.advContainer.height = Alloy.isTablet ? Alloy.CFG.gui.advertisementBannerHeightTablet : Alloy.CFG.gui.advertisementBannerHeight;
		$.contactInfo.bottom = Alloy.isTablet ? Alloy.CFG.gui.advertisementBannerHeightTablet : Alloy.CFG.gui.advertisementBannerHeight;
		
		$.advContainer.removeAllChildren();
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
			field.color = Alloy.CFG.gui.baseTextColor;
		}
	} else {
		hideInfoContainer(container);
	}
}

openExternalMap = function(data){
	data = data || {};
	data.searchString = data.searchString || "";
	data.latitude = data.latitude;
	data.longitude = data.longitude;
	
	var searchString;
	
	if (OS_IOS){
		searchString = data.searchString.replace(" ", "+").replace("&", "+");
		Ti.Platform.openURL("http://maps.apple.com/?q=@" + data.latitude + "," + data.longitude + "&sll=" + data.latitude + "," + data.longitude);
	} else {
		Ti.Platform.openURL("http://maps.google.com/?q=@" + data.latitude + "," + data.longitude);
	}
};

generateMapImage = function(data){
	data = data || {};
	data.latitude = data.latitude;
	data.longitude = data.longitude;
	
	var mapImage = Ti.UI.createImageView({
		"width": Ti.UI.FILL,
		"height": Ti.UI.FILL
	});
	mapImage.image = "https://maps.googleapis.com/maps/api/staticmap?center=" + data.latitude + "," + data.longitude + "&markers=" + data.latitude + "," + data.longitude + "&zoom=16&size=640x300&scale=2&key=" + Alloy.CFG.googleMapsKey;
	
	return mapImage;
};

generateMap = function(data){
	data = data || {};
	data.latitude = data.latitude;
	data.longitude = data.longitude;
	
	var mapView = TiMap.createView({
		"mapType": TiMap.NORMAL_TYPE,
		"region": {
			"latitude": data.latitude,
			"longitude": data.longitude,
			"latitudeDelta": 0.01,
			"longitudeDelta": 0.01,
			"zoom": 15,
			"tilt": 45
		},
		"animate": false,
		"enableCompass": false,
		"enableZoomControls": false,
		"rotateEnabled": false,
		"userLocation": true
	});
	mapView.addAnnotation(TiMap.createAnnotation({
		latitude: data.latitude,
		longitude: data.longitude
	}));
	
	return mapView;
};

orientationchange = function(){
	showAdvertisement(Ti.Network.online);
};
Ti.Gesture.addEventListener("orientationchange", orientationchange);

profile = args.profile;
listSource = args.listSource;
mapSource = args.mapSource;
typeData = ProfileTypeRepository.get(profile.tipo) || ProfileTypeRepository.getDefault();

Alloy.Globals.analyticsEvent({action: "profile-open", label: profile.id});

$.nome.text = profile.nome;
$.tipo.text = L(typeData.text);
$.indirizzo.text = ProfileRepository.addressToString(profile);

if (profile.tel){
	$.telefono.text = profile.tel;
	
	$.telefonoContainer.addEventListener("singletap", function(){
		Ti.Platform.openURL("tel:" + profile.tel);
	});
} else {
	hideInfoContainer($.telefonoContainer);
}

if (profile.email){
	$.email.text = profile.email;
	
	$.emailContainer.addEventListener("singletap", function(){
		if (OS_IOS && Ti.Platform.model === "Simulator"){
			alert("Simulator does not support sending emails. Use a device instead");
			return;
		}
		
		var emailDialog = Ti.UI.createEmailDialog();
		emailDialog.toRecipients = [profile.email];
		emailDialog.open();
	});
} else {
	hideInfoContainer($.emailContainer);
}

if (profile.web){
	$.web.text = profile.web.replace("https://", "").replace("http://", "");
	
	$.webContainer.addEventListener("singletap", function(){
		Ti.Platform.openURL(profile.web.indexOf("http") !== 0 ? "http://" + profile.web : profile.web);
	});
} else {
	hideInfoContainer($.webContainer);
}

(function(){
	var aperturaText, todayOpen, todayTimetable;
	
	if (profile.aperto && profile.aperto.length > 0){
		todayOpen = ProfileRepository.isTodayOpen(profile);
		if (todayOpen){
			todayTimetable = ProfileRepository.getTodayTimetable(profile);
			
			aperturaText = L("lblTodayOpen") + " " + todayTimetable.reduce(function(memo, time){
				var daParts, aParts;
				daParts = time.da.split(":");
				aParts = time.a.split(":");
				if (daParts.length === 3 && (daParts[2] === "00" || daParts[2] === "59")){
					daParts.pop();
				}
				if (aParts.length === 3 && (aParts[2] === "00" || aParts[2] === "59")){
					aParts.pop();
				}
				memo += memo.length > 0 ? ", " : "";
				return memo + daParts.join(":") + "-" + aParts.join(":");
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
$.tipiCibiValue.text = ProfileRepository.getFoodTypes(profile).map(function(tipo){
	return L("cibo.tipo." + tipo);
}).sort().join(", ").toLowerCase();

$.catCibiValue.text = ProfileRepository.getFoodCategories(profile).map(function(cat){
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
(function(){
	var mapOverlay, generatorFunction;
	
	if (Alloy.CFG.staticMapOnDetail){
		generatorFunction = generateMapImage;
	} else {
		generatorFunction = generateMap;
	}
	$.mapContainer.add(generatorFunction({"latitude": profile.lat, "longitude": profile.lon}));
	
	if (Alloy.CFG.mapOverlayOnDetail){
		mapOverlay = Ti.UI.createView({
			"width": Ti.UI.FILL,
			"height": Ti.UI.FILL
		});
		mapOverlay.addEventListener("singletap", function(){
			openExternalMap({
				"searchString": profile.nome,
				"latitude": profile.lat,
				"longitude": profile.lon
			});
		});
		$.mapContainer.add(mapOverlay);
	}
}());

if ($FM.exists(profile.id)) {
	$.addFavoriteBtn.setColor("yellow");
}

$.profile.addEventListener("close", function(){
	Ti.Gesture.removeEventListener("orientationchange", orientationchange);
});

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
