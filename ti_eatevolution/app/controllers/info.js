var currentTab, email, phone, toJoin, webOrganization, webCampaign, orientationCheck;

email = function() {
	Alloy.Globals.analyticsEvent({action: "info-email"});
	
	if (OS_IOS && Ti.Platform.model === "Simulator"){
		alert("Simulator does not support sending emails. Use a device instead");
		return;
	}

	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.subject = L("lblInfoEmailSubject");
	emailDialog.toRecipients = [Alloy.CFG.companyReferences.email];
	emailDialog.open();
};

phone = function(){
	Alloy.Globals.analyticsEvent({action: "info-phone"});
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else if (ENV_PRODUCTION){
		Ti.Platform.openURL("tel:" + Alloy.CFG.companyReferences.phone);
	}
};

toJoin = function(){
	var alert, options, optionsActions, selectedOption;
	
	options = [L("lblEmail"), L("lblPhone"), L("lblCancel")];
	optionsActions = [email, phone];
	
	alert = Ti.UI.createOptionDialog({"options": options, "cancel": 2});
	
	alert.addEventListener("click", function(alertEvent) {
		selectedOption = alertEvent.index;
		
		if (
			(OS_IOS && selectedOption !== alertEvent.cancel)
			||
			(OS_ANDROID && !alertEvent.cancel && selectedOption >= 0)
		){
			optionsActions[selectedOption]();
		}
	});
	alert.show();
};

webOrganization = function(){
	Alloy.Globals.analyticsEvent({action: "info-organization"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.web);
};
webCampaign = function(){
	Alloy.Globals.analyticsEvent({action: "info-campaign"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.campaign);
};

orientationCheck = function(){
	if (Alloy.isHandheld){
		if (Ti.Gesture.landscape){
			$.banner.visible = false;
			$.banner.height = 0;
		} else if (Ti.Gesture.portrait){
			$.banner.visible = true;
			$.banner.height = Ti.UI.SIZE;
		}
	}
};
Ti.Gesture.addEventListener("orientationchange", orientationCheck);

$.info.addEventListener("close", function(){
	Ti.Gesture.removeEventListener("orientationchange", orientationCheck);
});

if (OS_IOS){
	(function(){
		var nsfLogo = Alloy.Globals.createNSFLogo();
		nsfLogo.addEventListener("singletap", webCampaign);
		$.info.leftNavButton = nsfLogo;
		
		var joinButton = Ti.UI.createLabel({
			"text": Alloy.Globals.Icons.fontAwesome.chain,
			"color": Alloy.CFG.iosColor,
			"width": 26,
			"height": 26,
			"font": {
				"fontFamily": "font-awesome",
				"fontSize": 26
			}
		});
		joinButton.addEventListener("click", toJoin);
		
		$.info.rightNavButtons = [joinButton];
	}());
}

orientationCheck();

exports.toJoin = toJoin;
exports.webOrganization = webOrganization;
exports.webCampaign = webCampaign;
exports.setTab = function(tab){
	currentTab = tab;
};
