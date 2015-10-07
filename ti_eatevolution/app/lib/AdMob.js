var Admob = require('ti.admob');

var create = function(params) {
	params = params || {};
	
	var unitId = params['unitId'];
	
	if (OS_ANDROID){
		adMobArgs = {
			publisherId: unitId
		};
		eventReceived = Admob.AD_RECEIVED;
		eventFail = Admob.AD_NOT_RECEIVED;
	} else if (OS_IOS) {
		adMobArgs = {
			adUnitId: unitId
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
	
	return adMobView;
};

exports.create = create;