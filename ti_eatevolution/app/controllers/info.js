var args = arguments[0] || {};

$.address.text = Alloy.CFG.companyReferences.address;
$.phone.text = Alloy.CFG.companyReferences.phone + " - " + Alloy.CFG.companyReferences.mobilePhone;
$.email.text = Alloy.CFG.companyReferences.email;
$.web.text = Alloy.CFG.companyReferences.web;

function email() {
	Alloy.Globals.featureEvent({category:'info', action:'email'});
	
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
	Alloy.Globals.featureEvent({category:'info', action:'call'});
	
	if (ENV_DEV){
		Ti.Platform.openURL("tel:+393381540774");
	} else if (ENV_PRODUCTION){
		Ti.Platform.openURL("tel:" + Alloy.CFG.companyReferences.phone);
	}
};

function web(){
	Alloy.Globals.featureEvent({category:'info', action:'web'});
	
	Ti.Platform.openURL(Alloy.CFG.companyReferences.web);
};

exports.setTab = function(tab){
	currentTab = tab;
};