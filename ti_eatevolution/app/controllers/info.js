var currentTab, email, phone, toJoin, webOrganization, webCampaign, bannerAdjustment;

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
	
	Ti.Platform.openURL("tel:" + Alloy.CFG.companyReferences.phone);
};

toJoin = function(){
	var alert, options, optionsActions, optionDialogArgs, selectedOption;
	
	optionsActions = [email, phone];
	options = [L("lblEmail"), L("lblPhone")];
	if (OS_IOS && Alloy.isHandheld){
		options.push(L("lblCancel"));
	}
	
	optionDialogArgs = {"options": options};
	if (OS_IOS && Alloy.isHandheld){
		optionDialogArgs.cancel = 2;
	}
	
	alert = Ti.UI.createOptionDialog(optionDialogArgs);
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

bannerAdjustment = function(){
	if (
		Alloy.isTablet
		||
		(OS_IOS && Ti.Gesture.isLandscape())
		||
		(OS_ANDROID && Ti.Gesture.landscape)
	){
		$.banner.width = "60%";
	} else {
		$.banner.width = Ti.UI.FILL;
	}
};
Ti.Gesture.addEventListener("orientationchange", bannerAdjustment);

$.info.addEventListener("close", function(){
	Ti.Gesture.removeEventListener("orientationchange", bannerAdjustment);
});

$.joinButtonContainer.addEventListener("singletap", toJoin);

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

bannerAdjustment();
$.joinButtonLabel.text = $.joinButtonLabel.text.toUpperCase();

exports.toJoin = toJoin;
exports.webOrganization = webOrganization;
exports.webCampaign = webCampaign;
exports.setTab = function(tab){
	currentTab = tab;
};
