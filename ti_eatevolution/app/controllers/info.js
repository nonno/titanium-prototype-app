var currentTab, email, call, web, orientationCheck;

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

call = function(){
	Alloy.Globals.analyticsEvent({action: "info-call"});
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else if (ENV_PRODUCTION){
		Ti.Platform.openURL("tel:" + Alloy.CFG.companyReferences.phone);
	}
};

web = function(){
	Alloy.Globals.analyticsEvent({action: "info-web"});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.web);
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

orientationCheck();

exports.setTab = function(tab){
	currentTab = tab;
};
