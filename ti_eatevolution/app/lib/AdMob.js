var Admob = OS_IOS ? require("ti.admob") : null; // TODO ti.admob module doesn't work on Android with SDK >= 6.0

var create = function(params) {
	params = params || {};
	params.unitId = params.unitId;
	
	if (!Admob){ return; }
	
	var adMobArgs, eventReceived, eventFail, adMobView;
	
	if (OS_ANDROID){
		adMobArgs = {
			publisherId: params.unitId,
			smartBanner: true
		};
		eventReceived = Admob.AD_RECEIVED;
		eventFail = Admob.AD_NOT_RECEIVED;
	} else if (OS_IOS) {
		adMobArgs = {
			adUnitId: params.unitId
		};
		eventReceived = "didReceiveAd";
		eventFail = "didFailToReceiveAd";
	}
	
	adMobView = Admob.createView(adMobArgs);
	adMobView.addEventListener(eventReceived, function(e){
		Ti.API.debug("Ad received " + e.source.publisherId);
	});
	adMobView.addEventListener(eventFail, function(e){
		Ti.API.warn("Ad not received " + JSON.stringify(e));
	});
	
	if (Alloy.CFG.development){
		return Ti.UI.createView();
	}
	return adMobView;
};

exports.create = create;
