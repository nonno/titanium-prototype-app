if (OS_IOS){ // FIXME problem with ti.ga and ti.map
	Alloy.Globals.trackerGA = require('ti.ga').createTracker({
		trackingId: Alloy.CFG.gaTrackingId,
		useSecure: true
	});
}

Alloy.Globals.analyticsShowView = function(viewName){
	if (Alloy.Globals.trackerGA){
		Alloy.Globals.trackerGA.addScreenView(viewName);
	}
};
Alloy.Globals.analyticsEvent = function(params){
	params = params || {};
	params.action = params.action || '';
	params.label = params.label;
	params.value = params.value || 1;
	
	var category, eventString;
	
	category = Ti.Platform.osname;
	eventString = [category, params.action].join('-');
	
	Ti.API.debug('Feature event: ' + eventString);
	Ti.Analytics.featureEvent(eventString);
	
	if (Alloy.Globals.trackerGA){
		Alloy.Globals.trackerGA.addEvent({
			category: category,
			action: params.action,
			label: params.label,
			value: params.value
		});
	}
};

if (!ENV_PRODUCTION && Alloy.CFG.runTests) {
	require('tests/testsRunner');
}