var args = arguments[0] || {};

$.address.text = Alloy.CFG.companyReferences.address;
$.phone.text = Alloy.CFG.companyReferences.phone + " - " + Alloy.CFG.companyReferences.mobilePhone;
$.taxCode.text = Alloy.CFG.companyReferences.taxCode;
$.email.text = Alloy.CFG.companyReferences.email;
$.web.text = Alloy.CFG.companyReferences.web;

function email() {
	Ti.Analytics.featureEvent(Ti.Platform.osname+".info.email.clicked");
	
	if (OS_IOS && Ti.Platform.model === "Simulator"){
		alert("Simulator does not support sending emails. Use a device instead");
		return;
	}

	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.subject = L('lblInfoEmailSubject');
	emailDialog.toRecipients = [Alloy.CFG.companyReferences.email];
	emailDialog.open();
};

function call(){
	Ti.Analytics.featureEvent(Ti.Platform.osname+".info.call.clicked");
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else if (ENV_PRODUCTION){
		Ti.Platform.openURL("tel:" + Alloy.CFG.companyReferences.phone);
	}
};

function web(){
	Ti.Analytics.featureEvent(Ti.Platform.osname+".info.web.clicked");
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.web);
};

exports.setTab = function(tab){
	currentTab = tab;
};